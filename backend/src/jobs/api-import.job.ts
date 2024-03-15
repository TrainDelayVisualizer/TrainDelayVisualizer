import { Service } from "typedi";
import { ApiImportService } from "../services/import.service";
import { IJob } from "./job.interface";

@Service()
export class ApiImportJob implements IJob {

    constructor(private readonly importService: ApiImportService) { }

    async run() {
        await this.importService.runFullImport();
    }
}