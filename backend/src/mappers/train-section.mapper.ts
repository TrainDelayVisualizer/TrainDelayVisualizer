import { Section, TrainStation } from "@prisma/client";
import { SbbTrainStopDto } from "../model/sbb-api/sbb-train-stop.dto";
import { SectionSummaryDto } from "../model/section-summary.dto";
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

  static mapSameSectionsToSectionSummaryDto(sameSections: (Section & { stationFrom: TrainStation, stationTo: TrainStation })[]) {
    const sectionDto: SectionSummaryDto = {
      stationFrom: sameSections[0].stationFrom,
      stationTo: sameSections[0].stationTo,
      departureDelay: 0,
      arrivalDelay: 0
    };

    for (const section of sameSections) {
      const delayDeparture = this.caluclateDeparturesDelayMinutes(section);
      sectionDto.departureDelay = delayDeparture;
      const delayArrival = this.calculateArrivalDelayMinutes(section);
      sectionDto.arrivalDelay += delayArrival;
    }
    return sectionDto;
  }


  static caluclateDeparturesDelayMinutes(section: Section) {
    const plannedStart = section.plannedDeparture;
    const actualStart = section.actualDeparture;
    if (!plannedStart || !actualStart) {
      return 0;
    }
    const diff = actualStart.getTime() - plannedStart.getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }

  static calculateArrivalDelayMinutes(section: Section) {
    const plannedArrival = section.plannedArrival;
    const actualArrival = section.actualArrival;
    if (!plannedArrival || !actualArrival) {
      return 0;
    }
    const diff = actualArrival.getTime() - plannedArrival.getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }
}