import { TrainStationDto } from "./train-station.dto";

export interface SectionSummaryDto {
    stationFrom: TrainStationDto;
    stationTo: TrainStationDto;
    departureDelay: number;
    arrivalDelay: number;
}
