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
