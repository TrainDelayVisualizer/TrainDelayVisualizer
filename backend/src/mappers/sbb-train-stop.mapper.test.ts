import { TrainStation } from '@prisma/client';
import { SbbTrainStopDtoMapper } from './sbb-train-stop.mapper';
import { SbbApiHaltestellenDto } from '../model/sbb-api/sbb-api-haltestellen.dto';

describe('SbbTrainStopDtoMapper', () => {
  describe('mapValidTrainStations', () => {
    it('should map valid train stops', () => {
      const sbbTrainStops = [
        {
          bpuic: 123,
          name: 'Train Stop 1',
          lon: 1.23456789,
          lat: 9.87654321
        },
        {
          bpuic: 456,
          name: 'Train Stop 2',
          lon: 2.34567890,
          lat: 8.76543210
        },
        // Add more test cases here
      ] as SbbApiHaltestellenDto[];

      const expectedTrainStations: TrainStation[] = [
        {
          id: 123,
          description: 'Train Stop 1',
          lon: 1.23456789,
          lat: 9.87654321
        },
        {
          id: 456,
          description: 'Train Stop 2',
          lon: 2.34567890,
          lat: 8.76543210
        },
        // Add expected results for more test cases here
      ];

      const result = SbbTrainStopDtoMapper.mapValidTrainStations(sbbTrainStops);

      expect(result).toEqual(expectedTrainStations);
    });
  });

  describe('mapTrainStation', () => {
    it('should map a train stop', () => {
      const sbbTrainStop = {
        bpuic: 123,
        name: 'Train Stop 1',
        lon: 1.23456789,
        lat: 9.87654321
      } as SbbApiHaltestellenDto;

      const expectedTrainStation = {
        id: 123,
        description: 'Train Stop 1',
        lon: 1.23456789,
        lat: 9.87654321
      } as TrainStation;

      const result = SbbTrainStopDtoMapper.mapTrainStation(sbbTrainStop);

      expect(result).toEqual(expectedTrainStation);
    });
  });

  describe('sbbTrainStopDtoIsValid', () => {
    it('should return true for a valid train stop', () => {
      const sbbTrainStop = {
        bpuic: 123,
        name: 'Train Stop 1',
        lon: 1.23456789,
        lat: 9.87654321
      } as SbbApiHaltestellenDto;

      const result = SbbTrainStopDtoMapper.sbbTrainStopDtoIsValid(sbbTrainStop);

      expect(result).toBe(true);
    });

    it('should return false for an invalid train stop', () => {
      const sbbTrainStop = {
        bpuic: 123,
        name: 'Train Stop 1',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lon: null as any,
        lat: 9.87654321
      } as SbbApiHaltestellenDto;

      const result = SbbTrainStopDtoMapper.sbbTrainStopDtoIsValid(sbbTrainStop);

      expect(result).toBe(false);
    });
  });
});