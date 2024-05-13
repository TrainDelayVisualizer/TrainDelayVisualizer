import { Service } from "typedi";
import { TrainStation } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";
import { ValueLabelMapper } from "../mappers/value-label.mapper";
import { ValueLabelDto } from "../model/value-label.dto";
import { SectionUtils } from "../utils/section.utils";

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
            averageDelaySeconds: SectionUtils.calculateAverageDelaySeconds(all)
        };
    }


    public static sortStationsInTrainRides(unsortedRides: TrainRideWithSectionsDto[]) {
        return unsortedRides.map(ride => {
            ride.sections = ride.sections.sort((a, b) => (a.plannedDeparture?.getTime() || 0) - (b.plannedDeparture?.getTime() || 0));
            return ride;
        });
    }
}