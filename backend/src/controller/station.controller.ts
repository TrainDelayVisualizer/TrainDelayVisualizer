import { TrainStation } from "@prisma/client";
import { StationService } from "../services/station.service";
import { Service } from "typedi";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";
import express, { Express, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ServiceError } from "../model/service.exception";
import { ParsedQs } from "qs";

@Service()
export class StationController {
    constructor(private readonly stationService: StationService) { }

    async getStations(): Promise<TrainStation[]> {
        return this.stationService.getStations();
    }

    async getStationById(id: number): Promise<TrainStation | null> {
        return this.stationService.getStationById(id);
    }

    async getRidesByStationId(req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Promise<TrainRideWithSectionsDto[]> {
        if (!req.query.date) throw new ServiceError("API rides request does not have a date parameter");
        const date: Date = new Date(req.query.date as string);
        const page: number = req.query.page ? parseInt(req.query.page as string) : 0;
        return this.stationService.getRidesByStationId(parseInt(req.params.id as string), date, page);
    }
}