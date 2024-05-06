import { Line } from "@prisma/client";
import { LineService } from "../services/line.service";
import { Service } from "typedi";

@Service()
export class LineController {
    constructor(private readonly lineService: LineService) { }

    async getLines(): Promise<Line[]> {
        return this.lineService.getLines();
    }
}