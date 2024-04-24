import { ValueLabelMapper } from './value-label.mapper';
import { TrainStation } from "@prisma/client";

describe('ValueLabelMapper', () => {
  it('should map TrainStation to ValueLabelDto', () => {
    const trainStation: TrainStation = {
      id: 1,
      description: 'Test Station',
      lon: 0,
      lat: 0
    };

    const result = ValueLabelMapper.trainStationToValueLabelDto(trainStation);

    expect(result).toEqual({
      id: 1,
      value: 'Test Station',
      label: 'Test Station',
    });
  });

  it('should map values to ValueLabelDto', () => {
    const result = ValueLabelMapper.toDto('Test Value', 'Test Label', 1);

    expect(result).toEqual({
      id: 1,
      value: 'Test Value',
      label: 'Test Label',
    });
  });
});