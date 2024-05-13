import { Service } from "typedi";
import { IJob } from "./job.interface";
import { LineService } from "../services/line.service";

@Service()
export class LineStatisticJob implements IJob {

    constructor(private readonly lineService: LineService) { }

    async run() {
        await this.lineService.createLineStatisticForToday();
    }
}