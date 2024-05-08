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

    public async getRidesByStationId(stationId: number, date: Date, page: number): Promise<{ results: TrainRideWithSectionsDto[], averageDelaySeconds: number, page: number, count: number; }> {
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

    static calculateAverageDelaySeconds(trainRidesWithSections: ({ sections: Section[]; } & TrainRide)[]): number {

        let totalDelay = 0;
        let totalRides = 0;
        trainRidesWithSections.forEach(ride => {
            let rideDelay = 0;
            let rideSections = 0;
            ride.sections.forEach(section => {
                const delay = StationService.calculateDelayForSection(section);
                rideDelay += delay;
                rideSections++;
            });
            totalDelay += rideDelay;
            totalRides += rideSections;
        });
        return totalRides > 0 ? Math.round(totalDelay / totalRides) : 0;
    }

    static calculateDelayForSection(section: Section) {
        if (section.actualArrival && section.plannedArrival && section.plannedDeparture && section.actualDeparture) {
            const delayArrival = (section.actualArrival.getTime() - section.plannedArrival.getTime()) / 1000;
            const delayDeparture = (section.actualDeparture.getTime() - section.plannedDeparture.getTime()) / 1000;
            return Math.max(delayArrival, delayDeparture);
        
        } else if (section.actualArrival && section.plannedArrival) {
            return (section.actualArrival.getTime() - section.plannedArrival.getTime()) / 1000;
        
        } else if (section.actualDeparture && section.plannedDeparture) {
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