import { Service } from "typedi";
import { SbbApiHaltestellenDto } from "../model/sbb-api/sbb-api-haltestellen.dto";
import decompress from "decompress";
import { createReadStream } from "fs";
import { readFile, rm, writeFile } from "fs/promises";
import { EnvUtils } from "../utils/env.utils";
import logger from "../utils/logger.utils";
import { PathUtils } from "../utils/path.utils";
import { parse } from "csv-parse";
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { join } from "path";

@Service()
export class SbbApiAdapter {

    async getTrainConnectionData() {
        const dataPath = await this.downloadIstDatenDataIntoTempFolder();
        return JSON.parse(await readFile(dataPath, 'utf-8')) as SbbApiIstDatenDto[];
    }

    async getTrainStations() {
        const trainStationImportFilePath = await this.downloadTrainstationsIntoTempFolder();

        const apiTrainStationDto: SbbApiHaltestellenDto[] = [];
        const parser = createReadStream(trainStationImportFilePath)
            .pipe(parse({
                delimiter: ';',
                fromLine: 2,
            }));

        for await (const record of parser) {
            if (record[18] !== 'CH') {
                continue;
            }
            const apiTrainStationDtoItem: SbbApiHaltestellenDto = {
                bpuic: parseFloat(record[3]),
                name: record[7],
                lon: parseFloat(record[49]),
                lat: parseFloat(record[50]),
            }
            apiTrainStationDto.push(apiTrainStationDtoItem);
        }
        logger.info(`Parsed ${apiTrainStationDto.length} TrainStations from csv file.`);
        return apiTrainStationDto;
    }

    private async downloadTrainstationsIntoTempFolder() {
        const importName = 'SBB_Haltestellen_' + new Date().toDateString();
        const apiUrl = EnvUtils.get().sbbApiTrainStationData;
        logger.info(`Starting SBB TrainStations Import "${importName}"`);
        logger.info(`Downloading TrainStations from SBB ${apiUrl}...`);
        const savedZipPath = join(PathUtils.getSbbImportDataPath(), importName + '.zip');
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`Failed to download SBB Trainstations. Status: ${response.status} - ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        await writeFile(savedZipPath, Buffer.from(buffer));
        logger.info(`Saved SBB TrainStations to ${savedZipPath}`);

        logger.info('Decompressing TrainStations...');
        const decompressedFiles = await decompress(savedZipPath, PathUtils.getSbbImportDataPath());
        await rm(savedZipPath);
        if (decompressedFiles.length !== 1) {
            throw new Error('SBB TrainStation import: Expected exactly one file in the zip archive');
        }
        const decompressedPath = decompressedFiles[0].path;
        const csvImportFilePath = join(PathUtils.getSbbImportDataPath(), decompressedPath);
        logger.info(`Decompressed TrainStations to ${csvImportFilePath}`);
        return csvImportFilePath;
    }

    private async downloadIstDatenDataIntoTempFolder() {
        const importName = 'SBB_ist_daten_' + new Date().toDateString();
        const apiUrl = EnvUtils.get().sbbApiDataPreviousDay;
        logger.info(`Starting SBB TrainConnection Data Import "${importName}"`);
        logger.info(`Downloading TrainConnection Data from SBB ${apiUrl}...`);
        const savePath = join(PathUtils.getSbbImportDataPath(), importName + '.json');
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`Failed to download SBB TrainConnection Data. Status: ${response.status} - ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        await writeFile(savePath, Buffer.from(buffer));
        logger.info(`Saved SBB TrainConnection Data to ${savePath}`);
        return savePath;
    }

}