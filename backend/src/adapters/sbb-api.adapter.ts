import { Service } from "typedi";
import { SbbApiHaltestellenDto } from "../model/sbb-api/sbb-api-haltestellen.dto";
import decompress from "decompress";
import { createReadStream, createWriteStream } from "fs";
import { rm, rmdir, writeFile } from "fs/promises";
import { EnvUtils } from "../utils/env.utils";
import logger from "../utils/logger.utils";
import { PathUtils } from "../utils/path.utils";
import { parse } from "csv-parse";
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { join } from "path";
import { Readable } from "stream";
import fs from 'fs';
import https from 'https';
import { DateUtils } from "../utils/date.utils";

@Service()
export class SbbApiAdapter {

    async getTrainConnectionData() {
        const csvPath = await this.downloadIstDatenDataIntoTempFolder();
        const apiTrainStationDto: SbbApiIstDatenDto[] = [];
        const parser = createReadStream(csvPath)
            .pipe(parse({
                delimiter: ';',
                fromLine: 2,
            }));

        for await (const record of parser) {
            if (record[5] !== 'Zug') {
                continue;
            }

            // set all values to null if they are empty
            for (let i = 0; i < record.length; i++) {
                record[i] ||= null;
            }

            const apiTrainStationDtoItem: SbbApiIstDatenDto = {
                betriebstag: record[0],
                fahrt_bezeichner: record[1],
                betreiber_id: record[2],
                betreiber_abk: record[3],
                betreiber_name: record[4],
                produkt_id: record[5],
                linien_id: parseFloat(record[6]),
                linien_text: record[7],
                umlauf_id: record[8],
                verkehrsmittel_text: record[9],
                zusatzfahrt_tf: record[10]?.trim() === 'true', // todo boolean
                faellt_aus_tf: record[11]?.trim() === 'true', // todo boolean
                bpuic: parseFloat(record[12]),
                haltestellen_name: record[13],
                ankunftszeit: DateUtils.getDateTimeFromString(record[14]),
                an_prognose: DateUtils.getDateTimeFromString(record[15]),
                an_prognose_status:  record[16],
                abfahrtszeit: DateUtils.getDateTimeFromString(record[17]),
                ab_prognose: DateUtils.getDateTimeFromString(record[18]),
                ab_prognose_status: record[19],
                durchfahrt_tf: record[20]?.trim() === 'true' // todo boolean
            }
            apiTrainStationDto.push(apiTrainStationDtoItem);
        }
        logger.info(`Parsed ${apiTrainStationDto.length} TrainConnectionDataItems from csv file.`);
        return apiTrainStationDto;
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
            if (record[18] !== 'CH' || record[29] !== 'TRAIN') {
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

        await this.downloadFile(apiUrl, savedZipPath);
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
        const apiUrl = 'https://opentransportdata.swiss/de/dataset/istdaten/permalink'; //EnvUtils.get().sbbApiDataPreviousDay;
        logger.info(`Starting SBB TrainConnection Data Import "${importName}"`);
        logger.info(`Downloading TrainConnection Data from SBB ${apiUrl}...`);
        const savePath = join(PathUtils.getSbbImportDataPath(), importName + '.csv');

        await this.downloadFile(apiUrl, savePath);
        logger.info(`Saved SBB TrainConnection Data to ${savePath}`);
        return savePath;
    }

    async downloadFile(fileUrl: string, outputFile: string) {
        // Most performant way to download files using fetch: https://medium.com/deno-the-complete-reference/download-file-with-fetch-in-node-js-57dd370c973a

        const response = await fetch(fileUrl);
        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`Failed to download ${fileUrl}. Status: ${response.status} - ${response.statusText}`);
        }

        await new Promise<void>((resolve, reject) => {
            const writer = createWriteStream(outputFile, {
                encoding: 'utf-8'
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Readable.fromWeb(response.body! as any).pipe(writer);
            writer.on('finish', () => {
                writer.close(() => {
                    resolve();
                });
            });
            writer.on('error', async (err) => {
                await rm(outputFile); // Delete the file if an error occurs
                console.error(`Error downloading file from ${fileUrl} to ${outputFile}:`, err);
                reject(err);
            });
        });
    }

}