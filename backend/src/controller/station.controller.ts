import { TrainStation } from "@prisma/client";
import { StationService } from "../services/station.service";
import { Service } from "typedi";
import express from "express";
import { ValueLabelDto } from "../model/value-label.dto";
import { RidesByStationQueryDto } from "../model/rides-by-station-query.dto";

@Service()
export class StationController {
    constructor(private readonly stationService: StationService) { }

    async getStations(): Promise<TrainStation[]> {
        return this.stationService.getStations();
    }

    async getStationById(id: number): Promise<TrainStation | null> {
        return this.stationService.getStationById(id);
    }

    async filterStations(req: express.Request): Promise<ValueLabelDto[]> {
        return this.stationService.filterStations(req.query.s as string ?? '');
    }

    async getRidesByStationId(id: number, ridesQuery: RidesByStationQueryDto) {
        return this.stationService.getRidesByStationId(id, ridesQuery.date, ridesQuery.page);
    }
}
