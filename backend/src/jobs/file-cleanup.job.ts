import { Service } from "typedi";
import { IJob } from "./job.interface";
import { PathUtils } from "../utils/path.utils";
import path from "path";
import fs from "fs/promises";
import { DateUtils } from "../utils/date.utils";
import logger from "../utils/logger.utils";
import { statSync } from "fs";

@Service()
export class FileCleanupJob implements IJob {

    async run() {
        const folderWithDownloadedApiFiles = PathUtils.getSbbImportDataPath();

        const files = await fs.readdir(folderWithDownloadedApiFiles);
        const tenDaysAgo = DateUtils.subtractDays(new Date(), 10);

        const filesToDelete = await Promise.all(files
            .map(file => path.join(folderWithDownloadedApiFiles, file))
            .filter(file => {
                if (file.endsWith(".gitkeep")) {
                    return false;
                }
                const stats = statSync(file);
                return stats.isFile() && stats.mtime.getTime() < tenDaysAgo.getTime();
            }));

        logger.info(`Deleting ${filesToDelete.length} files older than 10 days:`);
        logger.info(filesToDelete.join("\n"));

        for (const file of filesToDelete) {
            await fs.unlink(file);
        }

        logger.info("File cleanup done.");
    }
}