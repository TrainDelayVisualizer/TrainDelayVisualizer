import { Service } from "typedi";
import { TrainStation } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";

@Service()
export class StationService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getStations(): Promise<TrainStation[]> {
        return await this.dataAccess.client.trainStation.findMany();
    }

    public async getStationById(id: number): Promise<TrainStation | null> {
        return await this.dataAccess.client.trainStation.findUnique({
            where: {
                id: id
            }
        });
    }
}