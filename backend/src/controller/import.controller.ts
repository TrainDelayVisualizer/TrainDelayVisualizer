import { ApiImportService } from "../services/import.service";
import { Service } from "typedi";

@Service()
export class ImportController {
    constructor(private readonly importService: ApiImportService) { }

    async runFullImport(): Promise<void> {
        await this.importService.runFullImport();
    }
}