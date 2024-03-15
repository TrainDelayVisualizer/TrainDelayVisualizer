import { cloneDeep } from 'lodash';
import { ApiImportService } from '../services/import.service';
import { DataUtils } from './data.utils';

describe(DataUtils.name, () => {


    it('should split train stations into new and existing with changes', () => {

        const newTrainStation = {
            id: 456,
            description: 'Train Stop 2',
            descriptionShort: 'TS2',
            lon: 2.34567890,
            lat: 8.76543210
        };

        const existingTrainStation = {
            id: 123,
            description: 'Train Stop 1',
            descriptionShort: 'TS1',
            lon: 1.23456789,
            lat: 9.87654321
        };

        const inputTrainStations = [
            newTrainStation,
            existingTrainStation,
        ];

        const existingTrainStations = [
            cloneDeep(existingTrainStation)
        ];

        const [newTrainStations, existingTrainStationsWithChanges] = DataUtils.splitIntoNewAndExistingItemsWithChanges(inputTrainStations, existingTrainStations, x => x.id);

        // Assert new train stations
        expect(newTrainStations).toEqual([newTrainStation]);

        // Assert existing train stations with changes
        expect(existingTrainStationsWithChanges).toEqual([]);
    });



    it('should split train stations into new and existing with changes for the existing one', () => {

        const existingWithoutChanges = {
            id: 456,
            description: 'Train Stop 2',
            descriptionShort: 'TS2',
            lon: 2.34567890,
            lat: 8.76543210
        };

        const existingTrainStation = {
            id: 123,
            description: 'Train Stop 1',
            descriptionShort: 'TS1',
            lon: 1.23456789,
            lat: 9.87654321
        };

        const existingTrainStationAfterChanges = {
            ...cloneDeep(existingTrainStation),
            descriptionShort: 'S12'
        }

        const inputTrainStations = [
            existingWithoutChanges,
            existingTrainStationAfterChanges,
        ];

        const existingTrainStations = [
            cloneDeep(existingTrainStation),
            cloneDeep(existingWithoutChanges),
        ];

        const [newTrainStations, existingTrainStationsWithChanges] = DataUtils.splitIntoNewAndExistingItemsWithChanges(inputTrainStations, existingTrainStations, x => x.id);

        // Assert new train stations
        expect(newTrainStations).toEqual([]);

        // Assert existing train stations with changes
        expect(existingTrainStationsWithChanges).toEqual([existingTrainStationAfterChanges]);
    });
});