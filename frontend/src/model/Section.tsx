import { Station } from "./Station";

export type Section = {
    stationFrom: Station,
    stationTo: Station,
    plannedArrival: string | null,
    plannedDeparture: string | null,
    actualDeparture: string | null,
    actualArrival: string | null,
    averageDepartureDelay: number,
    averageArrivalDelay: number,
};

export type SectionDTO = {
    stationFromId: number,
    stationToId: number,
    plannedArrival: string | null,
    plannedDeparture: string | null,
    actualDeparture: string | null,
    actualArrival: string | null,
};