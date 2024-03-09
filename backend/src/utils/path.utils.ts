import { join } from "path";

export class PathUtils {

    static getBasePath() {
        return join(__dirname.replace('dist', '')
            .replace('utils', ''), '');
    }
}