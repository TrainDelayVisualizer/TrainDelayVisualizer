import express, { Express, Request, Response } from "express";
import { EnvUtils } from "./utils/env.utils";
import { ServiceError } from "./model/service.exception";
import Container from "typedi";
import { TestService } from "./services/test.service";
import path from "path";
import { PathUtils } from "./utils/path.utils";
import fs from "fs";

const app: Express = express();
const port = EnvUtils.get().port || 5050;

export function startServer() {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/api", (req: Request, res: Response) =>
        getWrapper<string>(req, res, async () =>
            Container.get(TestService).getTest()));

    app.post("/api", async (req: Request, res: Response) =>
        postWrapper<{ name: string }, string>(req, res, async (data) =>
            Container.get(TestService).postTest(data.name)));


    app.get("/error", (req: Request, res: Response) =>
        getWrapper<string>(req, res, async () =>
            Container.get(TestService).getError()));

    app.get("/service-error", (req: Request, res: Response) =>
        getWrapper<string>(req, res, async () =>
            Container.get(TestService).getServiceError()));


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

    /**
     * Fallback for 404
     */
    app.get('*', (req, res) =>
        res.send({ error: "not found" })); // todo built frontend file path

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
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