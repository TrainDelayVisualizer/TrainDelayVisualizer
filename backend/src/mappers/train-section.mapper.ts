import { SbbTrainStopDto } from "../model/sbb-api/sbb-train-stop.dto";
import { TrainSectionDto } from "../model/train-section.dto";
import { BooleanUtils } from "../utils/boolean.utils";

export class TrainSectionDtoMapper {

  static mapTrainSection(previous: SbbTrainStopDto, current: SbbTrainStopDto): TrainSectionDto {
    return {
      lineName: current.linien_text,
      lineTrainType: current.verkehrsmittel_text,

      stationFromName: previous.haltestellen_name,
      stationFromId: previous.bpuic,

      stationToName: current.haltestellen_name,
      stationToId: current.bpuic,

      plannedDeparture: previous.abfahrtszeit,
      actualDeparture: previous.ab_prognose,

      plannedArrival: current.ankunftszeit,
      actualArrival: current.an_prognose,

      isDelay: BooleanUtils.convertToBoolean(previous.abfahrtsverspatung)
       || BooleanUtils.convertToBoolean(current.ankunftsverspatung),
      isCancelled: BooleanUtils.convertToBoolean(previous.faellt_aus_tf)
       || BooleanUtils.convertToBoolean(current.faellt_aus_tf),

      trainRideId: previous.fahrt_bezeichner
    }
  }
}