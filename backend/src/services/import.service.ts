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

@Service()
export class ApiImportService {

    constructor(private readonly dataAccess: DataAccessClient) { }

    private async downloadCurrentDataIntoTempFolder() {
        const importName = 'SBB_data_' + new Date().toISOString();
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
        await this.importTrainStations(sbbTrainStopDto);
    }

    private async importTrainStations(sbbTrainStopDto: SbbTrainStopDto[]) {
        this.dataAccess.client.$transaction(async (tx) => {
            logger.info('Extracting train stations...')
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
        });
    }

}