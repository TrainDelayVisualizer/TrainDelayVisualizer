import { Section, SectionDTO } from "../model/Section";
import { TrainRide, TrainRideDTO } from "../model/TrainRide";
import { serverUrl } from "./request";
import store from "../store/store";

export function loadSectionData(signal: AbortSignal, filter: Date, stationId: number, page: number): Promise<{trainRides: TrainRide[], count: number}> {
    const loadingFrom = new Date();
    return new Promise<{trainRides: TrainRide[], count: number}>((resolve, reject) => {
        fetch(serverUrl() + `/stations/${stationId}/rides?date=${filter.toISOString()}&page=${page}`, { signal }).then(res => res.json()).then(data => {
            setTimeout(() => {
                const trainRides: TrainRide[] = data.results.map((ride: TrainRideDTO): TrainRide => {
                    const sections: Section[] = ride.sections.map((section: SectionDTO): Section => {
                        let averageDepartureDelay = 0;
                        let averageArrivalDelay = 0;
                        if (section.actualDeparture && section.plannedDeparture) {
                            averageDepartureDelay = (new Date(section.actualDeparture).getTime() - new Date(section.plannedDeparture).getTime()) / 60000;
                            averageDepartureDelay = Math.max(0, averageDepartureDelay);
                        }
                        if (section.actualArrival && section.plannedArrival) {
                            averageArrivalDelay = (new Date(section.actualArrival).getTime() - new Date(section.plannedArrival).getTime()) / 60000;
                            averageArrivalDelay = Math.max(0, averageArrivalDelay);
                        }
                        return {
                            plannedArrival: section.plannedArrival,
                            plannedDeparture: section.plannedDeparture,
                            actualArrival: section.actualArrival,
                            actualDeparture: section.actualDeparture,
                            stationFrom: store.getState().station.allById[section.stationFromId],
                            stationTo: store.getState().station.allById[section.stationToId],
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
                resolve({ trainRides: trainRides, count: data.count });
            }, Math.floor(Math.random() * (10 - 3 + 1) + 3) * 100 - (new Date().getTime() - loadingFrom.getTime()));
        }).catch(error => {
            if (error.name !== 'AbortError') {
                console.error(error);
                reject(error);
            }
        });
    });
}