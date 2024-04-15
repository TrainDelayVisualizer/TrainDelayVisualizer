import { TrainStationDto } from "./train-station.dto";

export interface SectionSummaryDto {
    stationFrom: TrainStationDto;
    stationTo: TrainStationDto;
    averageDepartureDelay: number;
    averageArrivalDelay: number;
}
