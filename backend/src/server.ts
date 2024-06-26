import express, { Express, Request, Response } from "express";
import { ServiceError } from "./model/service.exception";
import Container from "typedi";
import path from "path";
import { PathUtils } from "./utils/path.utils";
import fs from "fs";
import { StationController } from "./controller/station.controller";
import logger from "./utils/logger.utils";
import { ImportController } from "./controller/import.controller";
import { SectionController } from "./controller/section.controller";
import { LineController } from "./controller/line.controller";
import { SectionFilterDto, sectionFilterZod } from "./model/section-filter.dto";
import { z } from "zod";
import { LineStatisticFilterDto, lineStatisticFilterZod } from "./model/line-statistic-filter.dto";
import { RidesByStationQueryDto, ridesByStationQueryZod } from "./model/rides-by-station-query.dto";

const app: Express = express();
const port = 4000;

export function startServer() {
    app.use(express.json());
    // enable cors
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(express.urlencoded({ extended: true }));

    app.get("/api/import", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(ImportController).runFullImport()));

    app.get("/api/statistic/line", (req: Request, res: Response) =>
        getWrapperWithQuery(req, res, async (filter: LineStatisticFilterDto) =>
            Container.get(LineController).getStatisticsForLine(filter), lineStatisticFilterZod));

    app.post("/api/sections", (req: Request, res: Response) =>
        postWrapper(req, res, async (filter: SectionFilterDto) =>
            Container.get(SectionController).getSectionsByFilter(filter), sectionFilterZod));

    app.get("/api/stations", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(StationController).getStations()));

    app.get("/api/stations/query", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(StationController).filterStations(req)));

    app.get("/api/stations/:id", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(StationController).getStationById(parseInt(req.params.id))));

    app.get("/api/stations/:id/rides", (req: Request, res: Response) =>
        getWrapperWithQuery(req, res, async (query: RidesByStationQueryDto) =>
            Container.get(StationController).getRidesByStationId(parseInt(req.params.id), query), ridesByStationQueryZod));

    app.get("/api/lines", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(LineController).getLines()));

    /**
     * Static files for frontend
     */
    app.use('/ui', express.static(path.join(PathUtils.getBasePath(), '../frontend/build')));
    app.get('/ui*', (req, res) => {
        const destPath: string = path.join(PathUtils.getBasePath(), '../frontend/build', req.url.split('/ui')[1]);
        if (!fs.existsSync(destPath)) {
            res.sendFile(path.join(PathUtils.getBasePath(), '../frontend/build/index.html'));
        } else {
            res.sendFile(destPath);
        }
    });
    app.get("/", (req, res) => {
        res.redirect("/ui");
    });

    /**
     * Fallback for 404
     */
    app.get('*', (req, res) =>
        res.send({ error: "not found" }));

    app.listen(port, () => {
        logger.info(`[server]: Server is running at http://localhost:${port}`);
    });
}

export async function getWrapper<TFuncResult>(req: Request, res: Response, func: () => Promise<TFuncResult>) {
    try {
        res.status(200).send(await func());
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(400).send({
                result: 'error',
                message: error.message
            });
            return;
        }
        console.error(error);
        res.status(400).send({
            result: 'error'
        });
    }
}

// eslint-disable-next-line
export async function getWrapperWithQuery<TBodyType, TFuncResult>(req: Request, res: Response, func: (data: TBodyType) => Promise<TFuncResult>, zodObject?: z.ZodObject<any>) {
    try {
        let queryParams = req.query;
        if (zodObject) {
            // throws error if body input is not valid
            queryParams = zodObject.parse(queryParams);
        }
        res.status(200).send(await func(queryParams as TBodyType));
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(400).send({
                result: 'error',
                message: error.message
            });
            return;
        }
        console.error(error);
        res.status(400).send({
            result: 'error'
        });
    }
}

// eslint-disable-next-line
export async function postWrapper<TBodyType, TFuncResult>(req: Request, res: Response, func: (data: TBodyType) => Promise<TFuncResult>, zodObject?: z.ZodObject<any>) {
    try {
        let body = req.body;
        if (zodObject) {
            // throws error if body input is not valid
            body = zodObject.parse(body);
        }
        res.status(200).send(await func(body as TBodyType));
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(400).send({
                result: 'error',
                message: error.message
            });
            return;
        }
        console.error(error);
        res.status(400).send({
            result: 'error'
        });
    }
}