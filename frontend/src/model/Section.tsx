export type Section = {
  stationFromId: number,
  stationToId: number,
  plannedArrival: string | null,
  plannedDeparture: string | null,
  actualDeparture: string | null,
  actualArrival: string | null,
};