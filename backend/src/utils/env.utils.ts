import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PathUtils } from "./path.utils";

export interface EnvVariables {
    port: number;
    someVar: string;
}

export class EnvUtils {

    private static cached?: EnvVariables;

    public static get() {
        if (this.cached) {
            return this.cached;
        }
        if ((process.env as any).USE_ENV_VARIABLE === 'true') {
            // Get env variables from local .env file.
            this.cached = EnvUtils.getEnvVariablesFromHostEnv(process.env as { [key: string]: string; });
        } else {
            const envFile = this.getEnvVariablesFromFile();
            this.cached = EnvUtils.getEnvVariablesFromHostEnv(envFile);
        }
        return this.cached;
    }

    private static getEnvVariablesFromHostEnv(env: { [key: string]: string; }): EnvVariables {
        return {
            someVar: env.DATABASE_URL,
            port: +env.port
        };
    }

    private static getEnvVariablesFromFile() {
        const envFilePath = join(PathUtils.getBasePath(), '.env');
        if (!existsSync(envFilePath)) {
            return {};
        }
        const fileContent = readFileSync(envFilePath, { encoding: 'utf-8' });
        return fileContent.split('\n')
            .filter(x => !!x)
            .map(x => x.split('='))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as any);
    }

    public static reloadEnv() {
        this.cached = undefined;
        return this.get();
    }
}
