import { TrainStation } from "@prisma/client";
import { ValueLabelDto } from "../model/value-label.dto";

export class ValueLabelMapper {

  static trainStationToValueLabelDto(trainStation: TrainStation): ValueLabelDto {
    return {
      id: trainStation.id,
      value: trainStation.description,
      label: trainStation.description
    }
  }
    
  static toDto(value: number | string, label: string, id?: number): ValueLabelDto {
    return { id, value, label };
  }
}