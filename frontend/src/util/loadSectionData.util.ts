import { Section, SectionDTO } from "../model/Section";
import { TrainRide, TrainRideDTO } from "../model/TrainRide";
import { serverUrl } from "./request";
import store from "../store/store";

const MIN_LOADING_MS = 3;
const MAX_LOADING_MS = 10;

export function loadSectionData(signal: AbortSignal, filter: Date, stationId: number, page: number): Promise<{ trainRides: TrainRide[], count: number, averageDelaySeconds: { arrival: number, departure: number; }; }> {
    const loadingFrom = new Date();
    return new Promise((resolve, reject) => {
        fetch(serverUrl() + `/stations/${stationId}/rides?date=${filter.toISOString()}&page=${page}`, { signal }).then(res => res.json()).then(data => {
            setTimeout(() => {
                const trainRides: TrainRide[] = data.results.map((ride: TrainRideDTO): TrainRide => {
                    const sections: Section[] = ride.sections.map((section: SectionDTO): Section => {
                        let averageDepartureDelay = 0;
                        let averageArrivalDelay = 0;
                        if (section.actualDeparture && section.plannedDeparture) {
                            averageDepartureDelay = (new Date(section.actualDeparture).getTime() - new Date(section.plannedDeparture).getTime()) / 1000;
                            averageDepartureDelay = Math.max(0, averageDepartureDelay);
                        }
                        if (section.actualArrival && section.plannedArrival) {
                            averageArrivalDelay = (new Date(section.actualArrival).getTime() - new Date(section.plannedArrival).getTime()) / 1000;
                            averageArrivalDelay = Math.max(0, averageArrivalDelay);
                        }
                        return {
                            plannedArrival: section.plannedArrival,
                            plannedDeparture: section.plannedDeparture,
                            actualArrival: section.actualArrival,
                            actualDeparture: section.actualDeparture,
                            stationFrom: store.getState().station.allById[section.stationFromId],
                            stationTo: store.getState().station.allById[section.stationToId],
                            isCancelled: section.isCancelled,
                            averageDepartureDelay,
                            averageArrivalDelay,
                        };
                    });
                    return {
                        name: ride.name,
                        lineName: ride.lineName,
                        sections,
                        plannedStart: ride.plannedStart,
                    };
                });
                resolve({ trainRides: trainRides, count: data.count, averageDelaySeconds: data.averageDelaySeconds });
            }, Math.floor(Math.random() * (MAX_LOADING_MS - MIN_LOADING_MS + 1) + MIN_LOADING_MS) * 100 - (new Date().getTime() - loadingFrom.getTime()));
        }).catch(error => {
            if (error.name !== 'AbortError') {
                console.error(error);
                reject(error);
            }
        });
    });
}