import { Service } from "typedi";
import { DataAccessClient } from "../database/data-access.client";
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { ListUtils } from "../utils/list.utils";
import { SbbTrainStopDtoMapper } from "../mappers/sbb-train-stop.mapper";
import { DataUtils } from "../utils/data.utils";
import logger from "../utils/logger.utils";
import { sortBy } from "lodash";
import { TrainSectionDto } from "../model/train-section.dto";
import { DateUtils } from "../utils/date.utils";
import { TrainSectionDtoMapper } from "../mappers/train-section.mapper";
import { Prisma, PrismaClient, Section } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { SbbApiAdapter } from "../adapters/sbb-api.adapter";
import { SbbApiHaltestellenDto } from "../model/sbb-api/sbb-api-haltestellen.dto";

type PrimsaTransaction = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Timeout for the import transaction (20 mins)
const IMPORT_TRANSACTION_TIMEOUT = 20 * 60 * 1000;

@Service()
export class ApiImportService {

    constructor(private readonly dataAccess: DataAccessClient,
        private readonly sbbApiAdapter: SbbApiAdapter
    ) { }


    async runFullImport() {
        await this.dataAccess.client.$transaction(async (tx) => {

            const sbbTrainConnectionDtos: SbbApiIstDatenDto[] = await this.sbbApiAdapter.getTrainConnectionData();
            const apiTrainStationDtos = await this.sbbApiAdapter.getTrainStations();

            const relevantTrainStationsDto = this.filterOutRelevantTrainStations(apiTrainStationDtos, sbbTrainConnectionDtos);
            logger.info(`Filtered out ${relevantTrainStationsDto.length} relevant train stations`);
            const existingTrainStationBpuics = await this.importTrainStations(relevantTrainStationsDto, tx);

            const trainSectionDtosGroupedByLine = this.groupTrainSectonsByLine(sbbTrainConnectionDtos, existingTrainStationBpuics);

            logger.info('Starting import transaction for train lines, rides and sections...');
            const trainLineIds = await this.importTrainLines(trainSectionDtosGroupedByLine, tx);
            const trainRideIds = await this.importTrainRides(trainSectionDtosGroupedByLine, trainLineIds, tx);
            await this.importTrainSections(trainSectionDtosGroupedByLine, trainLineIds, trainRideIds, tx);
            logger.info('Import transaction for train lines, rides and sections done');
        }, { timeout: IMPORT_TRANSACTION_TIMEOUT });
    }

    groupTrainSectonsByLine(sbbTrainConnectionDtos: SbbApiIstDatenDto[], existingTrainStationBpuics: number[]) {
        const groupByLine = ListUtils.groupBy(sbbTrainConnectionDtos, x => x.tdvFahrtBezeichner);

        const minDateForImportData = DateUtils.subtractDays(DateUtils.getMidnight(new Date()), 2);

        const trainSectionDtosGroupedByLine = new Map<string, TrainSectionDto[]>();
        for (const [key, value] of groupByLine) {
            const singleLineSorted = sortBy(value, x => x.abfahrtszeit?.getTime());
            const singleLine: (TrainSectionDto | null)[] = singleLineSorted.map((x, index) => {
                if (index === 0) {
                    return null;
                }

                const previous = singleLineSorted[index - 1];
                const current = x;

                // ignore invalid train stops
                if (!existingTrainStationBpuics.includes(previous.bpuic)
                    || !existingTrainStationBpuics.includes(current.bpuic)) {
                    return null;
                }

                if (current.abfahrtszeit && previous.abfahrtszeit &&
                    (previous.abfahrtszeit.getTime() < minDateForImportData.getTime() || current.abfahrtszeit.getTime() < minDateForImportData.getTime())) {
                    return null;
                }

                return TrainSectionDtoMapper.mapTrainSection(previous, current);
            });
            const singleLineNullsRemoved = ListUtils.removeNulls(singleLine);

            if (singleLineNullsRemoved.length > 0) {
                trainSectionDtosGroupedByLine.set(key, singleLineNullsRemoved);
            }
        }

        return trainSectionDtosGroupedByLine;
    }

    filterOutRelevantTrainStations(apiTrainStationDtos: SbbApiHaltestellenDto[], sbbTrainConnectionDtos: SbbApiIstDatenDto[]) {
        const apiTrainStationDtosMap = new Map(apiTrainStationDtos.map(x => [x.bpuic, x]));
        const relevantTrainStationsDto = new Map<number, SbbApiHaltestellenDto>();

        for (const trainConnectionDto of sbbTrainConnectionDtos) {
            const trainStationFrom = apiTrainStationDtosMap.get(trainConnectionDto.bpuic);
            const trainStationTo = apiTrainStationDtosMap.get(trainConnectionDto.bpuic);
            if (trainStationFrom) {
                relevantTrainStationsDto.set(trainStationFrom.bpuic, trainStationFrom);
            }
            if (trainStationTo) {
                relevantTrainStationsDto.set(trainStationTo.bpuic, trainStationTo);
            }
        }
        return Array.from(relevantTrainStationsDto.values());
    }

    private async importTrainStations(apiTrainStationDtos: SbbApiHaltestellenDto[], tx: PrimsaTransaction) {
        logger.info('Starting import train stations...');

        const existingTrainStationsInDb = await tx.trainStation.findMany();

        // Because every stop of every train is in the list, we need to distinct the list by the bpuic (train station id)
        const distictedInputTrainStops = ListUtils.distinctBy(apiTrainStationDtos, x => x.bpuic);
        const inputTrainStationDbo = SbbTrainStopDtoMapper.mapValidTrainStations(distictedInputTrainStops);
        const nInvalidTrainStations = distictedInputTrainStops.length - inputTrainStationDbo.length;

        const [newTrainStationsDbo, existingTrainStationsWithChanges] =
            DataUtils.splitIntoNewAndExistingItemsWithChanges(inputTrainStationDbo, existingTrainStationsInDb, x => x.id);

        await tx.trainStation.createMany({
            data: newTrainStationsDbo
        });

        // Prisma has no bulk update, so we need to update the existing train stations one by one.
        await this.dataAccess.updateManyItemsWithExistingTransaction('trainStation', existingTrainStationsWithChanges, x => x.id, tx);

        const totalExistingTrainStationsInDb = await tx.trainStation.findMany({
            select: {
                id: true
            }
        });

        logger.info(`Processed ${distictedInputTrainStops.length} train stations ` +
            `(${newTrainStationsDbo.length} new | ${existingTrainStationsWithChanges.length} updated | ${nInvalidTrainStations} invalid | total in DB before ${existingTrainStationsInDb.length} | total in DB now ${totalExistingTrainStationsInDb.length})`);

        logger.info('Import trainsaction train stations done');
        return totalExistingTrainStationsInDb.map(x => x.id);
    }

    private async importTrainLines(trainSectionDtoDictionary: Map<string, TrainSectionDto[]>, tx: PrimsaTransaction) {
        logger.info('Extracting train lines...');
        const existingTrainLinesInDb = await tx.line.findMany();

        const inputTrainLinesDbo = Array.from(trainSectionDtoDictionary.values()).map(x => {
            const firstSection = x[0];
            return {
                name: firstSection.lineName,
                trainType: firstSection.lineTrainType
            };
        });

        const distinctedInputTrainLines = ListUtils.distinctBy(inputTrainLinesDbo, x => x.name);
        const [newTrainLinesDbo, existingTrainLinesWithChanges] =
            DataUtils.splitIntoNewAndExistingItemsWithChanges(distinctedInputTrainLines, existingTrainLinesInDb, x => x.name);

        await tx.line.createMany({
            data: newTrainLinesDbo
        });

        await this.dataAccess.updateManyItemsWithExistingTransaction('line', existingTrainLinesWithChanges, x => x.name, tx, 'name');

        const totalExistingTrainLinesInDb = await tx.line.findMany({
            select: {
                name: true
            }
        });

        logger.info(`Processed ${distinctedInputTrainLines.length} train lines ` +
            `(${newTrainLinesDbo.length} new | ${existingTrainLinesWithChanges.length} updated | total in DB before ${existingTrainLinesInDb.length} | total in DB now ${totalExistingTrainLinesInDb.length})`);
        return totalExistingTrainLinesInDb.map(x => x.name);
    }

    private async importTrainRides(trainSectionDtoDictionary: Map<string, TrainSectionDto[]>, trainLineIds: string[], tx: PrimsaTransaction) {
        logger.info('Extracting train rides...');

        const midnightTwoDaysAgo = DateUtils.subtractDays(DateUtils.getMidnight(new Date()), 2);
        const existingTrainRidesInDb = await tx.trainRide.findMany({
            where: {
                plannedStart: {
                    gte: midnightTwoDaysAgo
                }
            }
        });

        const inputTrainRidesDbo = Array.from(trainSectionDtoDictionary.values()).map(x => {
            const firstSection = x[0];
            const lastSection = x[x.length - 1];
            return {
                id: firstSection.trainRideId,
                lineName: firstSection.lineName,
                name: firstSection.stationFromName + ' → ' + lastSection.stationToName,
                stationStartId: firstSection.stationFromId,
                stationEndId: lastSection.stationToId,
                plannedStart: firstSection.plannedDeparture,
                plannedEnd: lastSection.plannedArrival,
            };
        });

        const distinctedInputTrainRides = ListUtils.distinctBy(inputTrainRidesDbo, x => x.id);
        const validTrainRides = distinctedInputTrainRides.filter(x => trainLineIds.includes(x.lineName));

        const [newTrainRidesDbo, existingTrainRidesWithChanges] =
            DataUtils.splitIntoNewAndExistingItemsWithChanges(validTrainRides, existingTrainRidesInDb, x => x.id);

        await tx.trainRide.createMany({
            data: newTrainRidesDbo,
            skipDuplicates: true
        });

        await this.dataAccess.updateManyItemsWithExistingTransaction('trainRide', existingTrainRidesWithChanges, x => x.id, tx);

        const totalExistingTrainRidesInDb = await tx.trainRide.findMany({
            select: {
                id: true
            },
            where: {
                plannedStart: {
                    gte: midnightTwoDaysAgo
                }
            }
        });

        logger.info(`Processed ${distinctedInputTrainRides.length} train rides ` +
            `(${newTrainRidesDbo.length} new | ${existingTrainRidesWithChanges.length} updated | total in DB before ${existingTrainRidesInDb.length} | total in DB now ${totalExistingTrainRidesInDb.length})`);
        return totalExistingTrainRidesInDb.map(x => x.id);
    }


    private async importTrainSections(trainSectionDtosGroupedByLine: Map<string, TrainSectionDto[]>,
        trainLineIds: string[], trainRideIds: string[], tx: PrimsaTransaction) {
        logger.info('Extracting train sections...');

        const midnightTwoDaysAgo = DateUtils.subtractDays(DateUtils.getMidnight(new Date()), 2);

        const endOfToday = DateUtils.getEndOfDay(new Date());
        const existingSectionsInDb = await tx.section.findMany(
            {
                where: {
                    trainRide: {
                        plannedStart: {
                            gte: midnightTwoDaysAgo,
                            lte: endOfToday,
                        }
                    }
                }
            });

        logger.info(`Loaded existing sections in DB: ${existingSectionsInDb.length}`);

        const flatTrainSectionDtos = Array.from(trainSectionDtosGroupedByLine.values()).flat().filter(x => {
            const plannedDeparture = x.plannedDeparture;
            const plannedArrival = x.plannedArrival;

            if (plannedArrival === null || plannedDeparture === null) {
                return false;
            }

            return (plannedDeparture || x.plannedArrival) >= midnightTwoDaysAgo;
        });

        const distictedFlatTrainSectionDtos = ListUtils.distinctBy(flatTrainSectionDtos, x => `${x.stationFromId}-${x.stationToId}-${x.trainRideId}`);

        const validTrainSections = distictedFlatTrainSectionDtos.filter(x => trainLineIds.includes(x.lineName) && trainRideIds.includes(x.trainRideId));

        const chunked = ListUtils.chunk(validTrainSections, 10000);
        for (let i = 0; i < chunked.length; i++) {
            await this.importTrainSectionsChunk(chunked[i], i + 1, chunked.length, existingSectionsInDb, tx);
        }
        logger.info('Extracting train sections done');
    }


    private async importTrainSectionsChunk(trainSectionDtos: TrainSectionDto[], chunkIndex: number = 0, totalChunks: number = 0,
        existingSectionsInDb: Section[], tx: PrimsaTransaction) {

        const inputSectionsDbo = trainSectionDtos.map(x => {
            return {
                stationFromId: x?.stationFromId,
                stationToId: x?.stationToId,
                plannedDeparture: x?.plannedDeparture,
                actualDeparture: x?.actualDeparture,
                plannedArrival: x?.plannedArrival,
                actualArrival: x?.actualArrival,
                isDelay: x?.isDelay,
                isCancelled: x?.isCancelled,
                trainRideId: x?.trainRideId
            };
        });

        const [newSectionsDbo, existingSectionsWithChanges] =
            DataUtils.splitIntoNewAndExistingItemsWithChanges(inputSectionsDbo, existingSectionsInDb, x => `${x.stationFromId}-${x.stationToId}-${x.trainRideId}`);

        await tx.section.createMany({
            data: newSectionsDbo
        });

        for (const chunk of ListUtils.chunk(existingSectionsWithChanges, 50)) {
            await Promise.all(chunk.map(async dataItem => {
                await tx.section.update({
                    where: {
                        sectionId: {
                            stationFromId: dataItem.stationFromId,
                            stationToId: dataItem.stationToId,
                            trainRideId: dataItem.trainRideId
                        }
                    },
                    data: dataItem
                });
            }));
        }

        const totalExistingSectionsInDb = await tx.section.count();

        logger.info(`Processed ${inputSectionsDbo.length} sections` +
            `(${newSectionsDbo.length} new | ${existingSectionsWithChanges.length} updated | total in DB before ${existingSectionsInDb.length} | total in DB now ${totalExistingSectionsInDb})` +
            `[chunk ${chunkIndex} | ${totalChunks}]`);
    }
}
