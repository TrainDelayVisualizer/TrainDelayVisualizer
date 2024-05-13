import { Service } from "typedi";
import { Section, TrainRide, TrainStation } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";
import { ValueLabelMapper } from "../mappers/value-label.mapper";
import { ValueLabelDto } from "../model/value-label.dto";

@Service()
export class StationService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getStations(): Promise<TrainStation[]> {
        return await this.dataAccess.client.trainStation.findMany();
    }

    public async getStationById(id: number): Promise<TrainStation | null> {
        return await this.dataAccess.client.trainStation.findUnique({
            where: {
                id: id
            }
        });
    }

    public async filterStations(query: string): Promise<ValueLabelDto[]> {
        const trainStations = await this.dataAccess.client.trainStation.findMany({
            where: {
                description: {
                    contains: query,
                    mode: 'insensitive',
                }
            }
        });
        return trainStations.map(station => ValueLabelMapper.trainStationToValueLabelDto(station));
    }

    public async getRidesByStationId(stationId: number, date: Date, page: number): Promise<{ results: TrainRideWithSectionsDto[], averageDelaySeconds: { arrival: number, departure: number; }, page: number, count: number; }> {
        const unsortedRides = await this.dataAccess.client.trainRide.findMany({
            where: {
                sections: {
                    some: {
                        AND: [
                            {
                                OR: [
                                    { stationFromId: stationId },
                                    { stationToId: stationId }
                                ]
                            },
                            {
                                AND: [
                                    { plannedDeparture: { gte: date }, },
                                    { plannedDeparture: { lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, }
                                ]
                            },
                        ]
                    }
                }
            },
            include: {
                sections: true
            },
            orderBy: { plannedStart: 'asc' },
            skip: page * 20,
            take: 20
        });
        const all = await this.dataAccess.client.trainRide.findMany({
            where: {
                sections: {
                    some: {
                        AND: [
                            {
                                OR: [
                                    { stationFromId: stationId },
                                    { stationToId: stationId }
                                ]
                            },
                            {
                                AND: [
                                    { plannedDeparture: { gte: date }, },
                                    { plannedDeparture: { lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, }
                                ]
                            },
                        ]
                    }
                }
            },
            include: {
                sections: true
            }
        });

        // Also sort the train stations of each ride by their plannedDeparture time
        return {
            results: StationService.sortStationsInTrainRides(unsortedRides),
            page: page,
            count: all.length,
            averageDelaySeconds: StationService.calculateAverageDelaySeconds(all)
        };
    }

    static calculateAverageDelaySeconds(trainRidesWithSections: ({ sections: Section[]; } & TrainRide)[]): { arrival: number, departure: number; } {
        let totalArrivalDelay = 0;
        let totalDepartureDelay = 0;
        let totalRides = 0;
        trainRidesWithSections.forEach(ride => {
            let rideSections = 0;
            ride.sections.forEach(section => {
                const arrivalDelay = StationService.calculateArrivalDelayForSection(section);
                const departureDelay = StationService.calculateDepartureDelayForSection(section);
                totalArrivalDelay += Math.max(0, arrivalDelay);
                totalDepartureDelay += Math.max(0, departureDelay);
                rideSections++;
            });
            totalRides += rideSections;
        });
        return {
            arrival: totalRides > 0 && totalArrivalDelay > 0 ? Math.round(totalArrivalDelay / totalRides) : 0,
            departure: totalRides > 0 && totalDepartureDelay > 0 ? Math.round(totalDepartureDelay / totalRides) : 0
        };
    }

    static calculateArrivalDelayForSection(section: Section) {
        if (section.actualArrival && section.plannedArrival) {
            return (section.actualArrival.getTime() - section.plannedArrival.getTime()) / 1000;
        }
        return 0;
    }

    static calculateDepartureDelayForSection(section: Section) {
        if (section.actualDeparture && section.plannedDeparture) {
            return (section.actualDeparture.getTime() - section.plannedDeparture.getTime()) / 1000;
        }
        return 0;
    }

    public static sortStationsInTrainRides(unsortedRides: TrainRideWithSectionsDto[]) {
        return unsortedRides.map(ride => {
            ride.sections = ride.sections.sort((a, b) => (a.plannedDeparture?.getTime() || 0) - (b.plannedDeparture?.getTime() || 0));
            return ride;
        });
    }
}