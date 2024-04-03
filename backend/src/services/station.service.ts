import { Service } from "typedi";
import { TrainStation } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";

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

    public async getRidesByStationId(stationId: number, date: Date, page: number): Promise<TrainRideWithSectionsDto[]> {
        const unsortedRides = await this.dataAccess.client.trainRide.findMany({
            where: {
                AND: [
                    {
                        sections: {
                            some: {
                                OR: [
                                    { stationFromId: stationId },
                                    { stationToId: stationId }
                                ]
                            }
                        }
                    },
                    { plannedStart: date }
                ]
            },
            include: {
                sections: true
            },
            orderBy: { plannedStart: 'asc' },
            skip: page * 20,
            take: 20
        });

        // Also sort the train stations of each ride by their plannedDeparture time
        return StationService.sortStationsInTrainRides(unsortedRides);
    }

    public static sortStationsInTrainRides(unsortedRides: TrainRideWithSectionsDto[]) {
        return unsortedRides.map(ride => {
            ride.sections = ride.sections.sort((a, b) => a.plannedDeparture.getTime() - b.plannedDeparture.getTime());
            return ride;
        });
    }
}