import express, { Express, Request, Response } from "express";
import { EnvUtils } from "./utils/env.utils";
import { ServiceError } from "./model/service.exception";
import Container from "typedi";
import path from "path";
import { PathUtils } from "./utils/path.utils";
import fs from "fs";
import { StationController } from "./controller/station.controller";
import logger from "./utils/logger.utils";

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

    app.get("/api/stations", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(StationController).getStations()));

    app.get("/api/stations/:id", (req: Request, res: Response) =>
        getWrapper(req, res, async () =>
            Container.get(StationController).getStationById(parseInt(req.params.id))));

    /**
     * Static files for frontend
     */
    app.use('/ui', express.static(path.join(PathUtils.getBasePath(), '../frontend/build'))); // todo built frontend file path
    app.get('/ui*', (req, res) => {
        const destPath: string = path.join(PathUtils.getBasePath(), '../frontend/build', req.url.split('/ui')[1])
        if (!fs.existsSync(destPath)) {
            res.sendFile(path.join(PathUtils.getBasePath(), '../frontend/build/index.html'));
        } else {
            res.sendFile(destPath); // todo built frontend file path
        }
    });
    app.get("/", (req, res) => {
        res.redirect("/ui");
    });

    /**
     * Fallback for 404
     */
    app.get('*', (req, res) =>
        res.send({ error: "not found" })); // todo built frontend file path

    app.listen(port, () => {
        logger.info(`[server]: Server is running at http://localhost:${port}`);
    });
}

async function getWrapper<TFuncResult>(req: Request, res: Response, func: () => Promise<TFuncResult>) {
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
async function postWrapper<TBodyType, TFuncResult>(req: Request, res: Response, func: (data: TBodyType) => Promise<TFuncResult>) {
    try {
        res.status(200).send(await func(req.body as TBodyType));
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