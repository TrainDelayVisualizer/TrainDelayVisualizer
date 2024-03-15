import { join } from "path";

export class PathUtils {

    static getBasePath() {
        return join(__dirname.replace('dist', '')
            .replace('utils', ''), '');
    }

    static getTempPath() {
        return join(this.getBasePath(), 'temp');
    }


    static getDataPath() {
        return join(this.getBasePath(), 'data');
    }

    static getSbbImportDataPath() {
        return join(this.getDataPath(), 'sbb-import-data');
    }
}