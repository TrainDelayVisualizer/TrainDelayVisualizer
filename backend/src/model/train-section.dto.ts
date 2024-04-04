import { SbbTrainStopDto } from "./sbb-api/sbb-train-stop.dto";

export interface TrainSectionDto {
  lineName: string;
  lineTrainType: string;
  stationFromName: string;
  stationFromId: number;
  stationToName: string;
  stationToId: number;
  plannedDeparture: null;
  actualDeparture: null;
  plannedArrival: string;
  actualArrival: string;
  isDelay: boolean;
  isCancelled: boolean;
  trainRideId: string;
}