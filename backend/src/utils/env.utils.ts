import 'dotenv/config'
import { existsSync } from "fs";
import { join } from "path";
import { PathUtils } from "./path.utils";

export interface EnvVariables {
    databaseUrl: string;
    sbbApiDataPreviousDay: string;
    sbbApiTrainStationData: string;
}

export class EnvUtils {

    private static cached?: EnvVariables;

    public static get() {
        if (this.cached) {
            return this.cached;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((process.env as any).USE_ENV_VARIABLE !== 'true') {
            // configuring .env file in backend folder --> must be set by each developer
            if (!existsSync(join(PathUtils.getBasePath(), '.env'))) {
                throw new Error('[ONLY IN DEV MODE] No .env file found in backend folder. Please create one and add environment variables.');
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('dotenv').config()
        }
        this.cached = EnvUtils.getEnvVariablesFromHostEnv(process.env as { [key: string]: string; });
        return this.cached;
    }

    private static getEnvVariablesFromHostEnv(env: { [key: string]: string; }): EnvVariables {
        return {
            databaseUrl: env.DATABASE_URL,
            sbbApiDataPreviousDay: env.SBB_API_ACTUAL_DATA_PREVIOUS_DAY,
            sbbApiTrainStationData: env.SBB_API_TRAIN_STATION_DATA,
        };
    }

    public static reloadEnv() {
        this.cached = undefined;
        return this.get();
    }
}
