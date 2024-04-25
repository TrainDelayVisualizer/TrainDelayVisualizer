export interface TrainSectionDto {
  lineName: string;
  lineTrainType: string;
  stationFromName: string;
  stationFromId: number;
  stationToName: string;
  stationToId: number;
  plannedDeparture: Date | null;
  actualDeparture: Date | null;
  plannedArrival: Date | null;
  actualArrival: Date | null;
  isDelay: boolean;
  isCancelled: boolean;
  trainRideId: string;
}