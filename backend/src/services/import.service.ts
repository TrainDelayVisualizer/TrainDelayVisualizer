import { Service } from "typedi";
import { DataAccessClient } from "../database/data-access.client";
import { SbbTrainStopDto } from "../model/sbb-api/sbb-train-stop.dto";
import { ListUtils } from "../utils/list.utils";
import { PathUtils } from "../utils/path.utils";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { SbbTrainStopDtoMapper } from "../mappers/sbb-train-stop.mapper";
import { EnvUtils } from "../utils/env.utils";
import { DataUtils } from "../utils/data.utils";
import logger from "../utils/logger.utils";
import { groupBy, reduce, set, sortBy, values } from "lodash";
import { Dictionary } from "express-serve-static-core";
import { TrainSectionDto } from "../model/train-section.dto";
import { DateUtils } from "../utils/date.utils";
import { TrainSectionDtoMapper } from "../mappers/train-section.mapper";
import { Prisma, PrismaClient, Section } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

type PrimsaTransaction = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Timeout for the import transaction (20 mins)
const IMPORT_TRANSACTION_TIMEOUT = 20 * 60 * 1000;

@Service()
export class ApiImportService {

  constructor(private readonly dataAccess: DataAccessClient) { }

  private async downloadCurrentDataIntoTempFolder() {
    const importName = 'SBB_data_' + new Date().toDateString();
    logger.info(`Starting SBB Data Import "${importName}"`);
    logger.info('Downloading data from SBB...');
    const savePath = join(PathUtils.getSbbImportDataPath(), importName + '.json');
    const response = await fetch(EnvUtils.get().sbbApiDataPreviousDay);
    if (!response.ok) {
      console.error(await response.text());
      throw new Error(`Failed to download SBB data. Status: ${response.status} - ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    await writeFile(savePath, Buffer.from(buffer));
    logger.info(`Saved SBB data to ${savePath}`);
    return savePath;
  }

  async runFullImport() {
    const dataPath = await this.downloadCurrentDataIntoTempFolder();
    const sbbTrainStopDto = JSON.parse(await readFile(dataPath, 'utf-8')) as SbbTrainStopDto[];
    logger.info(`Processing ${sbbTrainStopDto.length} train stops`);

    await this.importTrainConnectionData(sbbTrainStopDto);
  }

  private async importTrainStations(sbbTrainStopDto: SbbTrainStopDto[], tx: PrimsaTransaction) {
    logger.info('Extracting train stations...');
    const existingTrainStationsInDb = await tx.trainStation.findMany();

    // Because every stop of every train is in the list, we need to distinct the list by the bpuic (train station id)
    const distictedInputTrainStops = ListUtils.distinctBy(sbbTrainStopDto, x => x.bpuic);
    const inputTrainStationDbo = SbbTrainStopDtoMapper.mapValidTrainStations(distictedInputTrainStops);
    const nInvalidTrainStations = distictedInputTrainStops.length - inputTrainStationDbo.length;

    const [newTrainStationsDbo, existingTrainStationsWithChanges] =
      DataUtils.splitIntoNewAndExistingItemsWithChanges(inputTrainStationDbo, existingTrainStationsInDb, x => x.id);

    await tx.trainStation.createMany({
      data: newTrainStationsDbo
    });

    // Prisma has no bulk update, so we need to update the existing train stations one by one.
    await this.dataAccess.updateManyItemsWithExistingTransaction('trainStation', existingTrainStationsWithChanges, x => x.id, tx);

    const totalExistingTrainStationsInDb = await tx.trainStation.count();

    logger.info(`Processed ${distictedInputTrainStops.length} train stations ` +
      `(${newTrainStationsDbo.length} new | ${existingTrainStationsWithChanges.length} updated | ${nInvalidTrainStations} invalid | total in DB before ${existingTrainStationsInDb.length} | total in DB now ${totalExistingTrainStationsInDb})`);
  }

  private async importTrainLines(trainSectionDtoDictionary: Dictionary<TrainSectionDto[]>, tx: PrimsaTransaction) {
    logger.info('Extracting train lines...');
    const existingTrainLinesInDb = await tx.line.findMany();

    const inputTrainLinesDbo = Object.values(trainSectionDtoDictionary).map(x => {
      const firstSection = x[0];
      return {
        name: firstSection.lineName,
        trainType: firstSection.lineTrainType
      }
    });

    const distinctedInputTrainLines = ListUtils.distinctBy(inputTrainLinesDbo, x => x.name);
    const [newTrainLinesDbo, existingTrainLinesWithChanges] =
      DataUtils.splitIntoNewAndExistingItemsWithChanges(distinctedInputTrainLines, existingTrainLinesInDb, x => x.name);

    await tx.line.createMany({
      data: newTrainLinesDbo
    });

    await this.dataAccess.updateManyItemsWithExistingTransaction('line', existingTrainLinesWithChanges, x => x.name, tx);

    const totalExistingTrainLinesInDb = await tx.line.count();

    logger.info(`Processed ${distinctedInputTrainLines.length} train lines ` +
      `(${newTrainLinesDbo.length} new | ${existingTrainLinesWithChanges.length} updated | total in DB before ${existingTrainLinesInDb.length} | total in DB now ${totalExistingTrainLinesInDb})`);
  }

  private async importTrainRides(trainSectionDtoDictionary: Dictionary<TrainSectionDto[]>, tx: PrimsaTransaction) {
    logger.info('Extracting train rides...');
    const existingTrainRidesInDb = await tx.trainRide.findMany();

    const inputTrainRidesDbo = Object.values(trainSectionDtoDictionary).map(x => {
      const firstSection = x[0];
      const lastSection = x[x.length - 1];
      return {
        id: firstSection.trainRideId,
        lineName: firstSection.lineName,
        name: firstSection.stationFromName + ' → ' + lastSection.stationToName,
        stationStartId: firstSection.stationFromId,
        stationEndId: lastSection.stationToId,
        plannedStart: DateUtils.getDateTimeFromString(firstSection.plannedDeparture) ?? '',
        plannedEnd: DateUtils.getDateTimeFromString(lastSection.plannedArrival) ?? '',
      }
    });

    const distinctedInputTrainRides = ListUtils.distinctBy(inputTrainRidesDbo, x => x.id);

    const [newTrainRidesDbo, existingTrainRidesWithChanges] =
      DataUtils.splitIntoNewAndExistingItemsWithChanges(distinctedInputTrainRides, existingTrainRidesInDb, x => x.id);

    await tx.trainRide.createMany({
      data: newTrainRidesDbo,
      skipDuplicates: true
    });

    await this.dataAccess.updateManyItemsWithExistingTransaction('trainRide', existingTrainRidesWithChanges, x => x.id, tx);

    const totalExistingTrainRidesInDb = await tx.trainRide.count();

    logger.info(`Processed ${distinctedInputTrainRides.length} train rides ` +
      `(${newTrainRidesDbo.length} new | ${existingTrainRidesWithChanges.length} updated | total in DB before ${existingTrainRidesInDb.length} | total in DB now ${totalExistingTrainRidesInDb})`);
  }


  private async importTrainSections(trainSectionDtosGroupedByLine: Dictionary<TrainSectionDto[]>, tx: PrimsaTransaction) {
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

    const flatTrainSectionDtos = values(trainSectionDtosGroupedByLine).flat().filter(x => {
      const plannedDeparture = DateUtils.getDateTimeFromString(x.plannedDeparture);
      const plannedArrival = DateUtils.getDateTimeFromString(x.plannedArrival);

      if (plannedArrival === null || plannedDeparture === null) {
        return false;
      }

      return (plannedDeparture || plannedArrival) >= midnightTwoDaysAgo;
    });

    const distictedFlatTrainSectionDtos = ListUtils.distinctBy(flatTrainSectionDtos, x => `${x.stationFromId}-${x.stationToId}-${x.trainRideId}`);
    const chunked = ListUtils.chunk(distictedFlatTrainSectionDtos, 5000);
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
        plannedDeparture: DateUtils.getDateTimeFromString(x?.plannedDeparture ?? ''),
        actualDeparture: DateUtils.getDateTimeFromString(x?.actualDeparture ?? ''),
        plannedArrival: DateUtils.getDateTimeFromString(x?.plannedArrival ?? ''),
        actualArrival: DateUtils.getDateTimeFromString(x?.actualArrival ?? ''),
        isDelay: x?.isDelay,
        isCancelled: x?.isCancelled,
        trainRideId: x?.trainRideId
      }
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

    await this.dataAccess.updateManyItemsWithExistingTransaction('section', existingSectionsWithChanges, x => `${x.stationFromId}-${x.stationToId}-${x.trainRideId}`, tx);

    const totalExistingSectionsInDb = await tx.section.count();

    logger.info(`Processed ${inputSectionsDbo.length} sections` +
      `(${newSectionsDbo.length} new | ${existingSectionsWithChanges.length} updated | total in DB before ${existingSectionsInDb.length} | total in DB now ${totalExistingSectionsInDb})` +
      `[chunk ${chunkIndex} | ${totalChunks}]`);
  }

  private async importTrainConnectionData(sbbTrainStopDto: SbbTrainStopDto[]) {
    const groupByLine = groupBy(sbbTrainStopDto, x => x.linien_id);

    const trainSectionDtosGroupedByLine = reduce(groupByLine, (acc, value, key) => {
      const singleLineSorted = sortBy(value, x => x.abfahrtszeit);
      const singleLine: (TrainSectionDto | null)[] = singleLineSorted.map((x, index) => {
        if (index === 0) {
          return null;
        }

        const previous = singleLineSorted[index - 1];
        const current = x;

        // ignore invalid train stops
        if (!SbbTrainStopDtoMapper.sbbTrainStopDtoIsValid(previous)
          || !SbbTrainStopDtoMapper.sbbTrainStopDtoIsValid(current)) {
          return null;
        }

        return TrainSectionDtoMapper.mapTrainSection(previous, current);
      });
      const singleLineNullsRemoved = ListUtils.removeNulls(singleLine);

      if (singleLineNullsRemoved.length > 0) {
        return set(acc, key, singleLineNullsRemoved);
      }

      return acc;
    }, {} as Dictionary<TrainSectionDto[]>);

    await this.dataAccess.client.$transaction(async (tx) => {
      logger.info('Starting import transaction');
      await this.importTrainStations(sbbTrainStopDto, tx);
      await this.importTrainLines(trainSectionDtosGroupedByLine, tx);
      await this.importTrainRides(trainSectionDtosGroupedByLine, tx);
      await this.importTrainSections(trainSectionDtosGroupedByLine, tx);
      logger.info('Import transaction done');
    }, { timeout: IMPORT_TRANSACTION_TIMEOUT });
  }
}