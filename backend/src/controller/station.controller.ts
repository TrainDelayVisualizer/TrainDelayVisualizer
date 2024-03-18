import { TrainStation } from "@prisma/client";
import { StationService } from "../services/station.service";
import { Service } from "typedi";

@Service()
export class StationController {
    constructor(private readonly stationService: StationService) { }

    async getStations(): Promise<TrainStation[]> {
        return this.stationService.getStations();
    }

    async getStationById(id: number): Promise<TrainStation | null> {
        return this.stationService.getStationById(id);
    }
}