import { Section, TrainStation } from "@prisma/client";
import { SbbApiIstDatenDto } from "../model/sbb-api/sbb-api-ist-daten.dto";
import { SectionSummaryDto } from "../model/section-summary.dto";
import { TrainSectionDto } from "../model/train-section.dto";
import { BooleanUtils } from "../utils/boolean.utils";
import { mean } from "lodash";

export class TrainSectionDtoMapper {

  static mapTrainSection(previous: SbbApiIstDatenDto, current: SbbApiIstDatenDto): TrainSectionDto {
    return {
      lineName: current.linien_text,
      lineTrainType: current.verkehrsmittel_text,
      lineTrainOperator: current.betreiber_name,

      stationFromName: previous.haltestellen_name,
      stationFromId: previous.bpuic,

      stationToName: current.haltestellen_name,
      stationToId: current.bpuic,

      plannedDeparture: previous.abfahrtszeit,
      actualDeparture: previous.ab_prognose,

      plannedArrival: current.ankunftszeit,
      actualArrival: current.an_prognose,

      isDelay: this.evaluateIfSbbApiIstDatenDtoHasDelay(current, 'an_prognose', 'ankunftszeit')
        || this.evaluateIfSbbApiIstDatenDtoHasDelay(previous, 'ab_prognose', 'abfahrtszeit'),
      isCancelled: BooleanUtils.convertToBoolean(previous.faellt_aus_tf)
        || BooleanUtils.convertToBoolean(current.faellt_aus_tf),

      trainRideId: previous.tdvFahrtBezeichner
    }
  }

  static evaluateIfSbbApiIstDatenDtoHasDelay(dto: SbbApiIstDatenDto,
    timetableField: keyof SbbApiIstDatenDto, actualField: keyof SbbApiIstDatenDto) {
    const timetable = dto[timetableField] as Date | null;
    const actual = dto[actualField] as Date | null;

    // check if actual is mre than one minute delayed
    if (timetable && actual) {
      const diff = actual.getTime() - timetable.getTime();
      return diff > 60000;
    }
    return false;
  }

  static mapSameSectionsToSectionSummaryDto(sameSections: (Section & { stationFrom: TrainStation, stationTo: TrainStation })[]): SectionSummaryDto {

    const departureDelays = sameSections.map(section => this.caluclateDeparturesDelayMinutes(section));
    const arrivalDelays = sameSections.map(section => this.calculateArrivalDelayMinutes(section));

    const averageDepartureDelay = Math.round(mean(departureDelays) * 100) / 100;
    const averageArrivalDelay = Math.round(mean(arrivalDelays) * 100) / 100;

    return {
      stationFrom: sameSections[0].stationFrom,
      stationTo: sameSections[0].stationTo,
      averageDepartureDelay: averageDepartureDelay,
      averageArrivalDelay: averageArrivalDelay
    };
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