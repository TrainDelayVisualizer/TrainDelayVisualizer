import { Line } from "@prisma/client";
import { LineService } from "../services/line.service";
import { Service } from "typedi";
import { LineStatisticFilterDto } from "../model/line-statistic-filter.dto";

@Service()
export class LineController {
    constructor(private readonly lineService: LineService) { }

    async getLines(): Promise<Line[]> {
        return this.lineService.getLines();
    }

    async getStatisticsForLine(query: LineStatisticFilterDto) {
        return this.lineService.getStatisticsForLine(query.from, query.to, query.lineName);
    }
}