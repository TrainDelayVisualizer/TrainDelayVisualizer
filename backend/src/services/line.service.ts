import { Service } from "typedi";
import { Line } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";

@Service()
export class LineService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getLines(): Promise<Line[]> {
        return await this.dataAccess.client.line.findMany();
    }
}