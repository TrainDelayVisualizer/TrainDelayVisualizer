import { describe } from "node:test";
import { EnvUtils } from './env.utils';
import { PathUtils } from "./path.utils";

describe(EnvUtils.name, () => {
    describe('getEnvVariablesFromHostEnv', () => {
        it('should return the environment variables from the host environment', () => {
            // Arrange
            const env = {
                DATABASE_URL: 'db-url',
                SBB_API_ACTUAL_DATA_PREVIOUS_DAY: 'api-data-previous-day',
                SBB_API_TRAIN_STATION_DATA: 'api-train-station-data',
            };

            // Act
            const result = EnvUtils['getEnvVariablesFromHostEnv'](env);

            // Assert
            expect(result).toEqual({
                databaseUrl: 'db-url',
                sbbApiDataPreviousDay: 'api-data-previous-day',
                sbbApiTrainStationData: 'api-train-station-data',
            });
        });

        it('should return undefined for missing environment variables', () => {
            // Arrange
            const env = {};

            // Act
            const result = EnvUtils['getEnvVariablesFromHostEnv'](env);

            // Assert
            expect(result).toEqual({
                databaseUrl: undefined,
                sbbApiDataPreviousDay: undefined,
                sbbApiTrainStationData: undefined,
            });
        });
    });
    describe('get', () => {
        it('should return the cached environment variables if already set', () => {
            // Arrange
            const cachedEnv = {
                databaseUrl: 'db-url',
                sbbApiDataPreviousDay: 'api-data-previous-day',
                sbbApiTrainStationData: 'api-train-station-data',
            };
            EnvUtils['cached'] = cachedEnv;

            // Act
            const result = EnvUtils.get();

            // Assert
            expect(result).toEqual(cachedEnv);
        });
    });

    describe('getEnvVariablesFromHostEnv', () => {
        it('should return the environment variables from the host environment', () => {
            // Arrange
            const env = {
                DATABASE_URL: 'db-url',
                SBB_API_ACTUAL_DATA_PREVIOUS_DAY: 'api-data-previous-day',
                SBB_API_TRAIN_STATION_DATA: 'api-train-station-data',
            };

            // Act
            const result = EnvUtils['getEnvVariablesFromHostEnv'](env);

            // Assert
            expect(result).toEqual({
                databaseUrl: 'db-url',
                sbbApiDataPreviousDay: 'api-data-previous-day',
                sbbApiTrainStationData: 'api-train-station-data',
            });
        });

        it('should return undefined for missing environment variables', () => {
            // Arrange
            const env = {};

            // Act
            const result = EnvUtils['getEnvVariablesFromHostEnv'](env);

            // Assert
            expect(result).toEqual({
                databaseUrl: undefined,
                sbbApiDataPreviousDay: undefined,
                sbbApiTrainStationData: undefined,
            });
        });
    });

    describe('get', () => {
        it('should return the cached environment variables if already set', () => {
            // Arrange
            const cachedEnv = {
                databaseUrl: 'db-url',
                sbbApiDataPreviousDay: 'api-data-previous-day',
                sbbApiTrainStationData: 'api-train-station-data',
            };
            EnvUtils['cached'] = cachedEnv;

            // Act
            const result = EnvUtils.get();

            // Assert
            expect(result).toEqual(cachedEnv);
        });
    });

    describe('reloadEnv', () => {
        it('should reset the cached environment variables', () => {
            // Arrange
            const cachedEnv = {
                databaseUrl: process.env.DATABASE_URL,
                sbbApiDataPreviousDay: process.env.SBB_API_ACTUAL_DATA_PREVIOUS_DAY,
                sbbApiTrainStationData: process.env.SBB_API_TRAIN_STATION_DATA,
            };
            EnvUtils['cached'] = {
                databaseUrl: 'db-url',
                sbbApiDataPreviousDay: 'api-data-previous-day',
                sbbApiTrainStationData: 'api-train-station-data',
            };

            // Act
            const result = EnvUtils.reloadEnv();

            // Assert
            expect(result).toEqual(cachedEnv);
        });
    });
});