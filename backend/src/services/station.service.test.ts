import { assert } from "console";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";
import { deepStrictEqual } from 'assert';
import { StationService } from "./station.service";
import { DataAccessClient } from "../database/data-access.client";
import { TrainStation } from "@prisma/client";

it('should sort all the stations in each train ride based on plannedDeparture', () => {
    const unsortedRides: TrainRideWithSectionsDto[] = [
        {
            id: '1',
            plannedStart: new Date('2024-01-01'),
            plannedEnd: new Date('2024-01-02'),
            lineName: 'Line 1',
            name: 'Ride 1',
            stationStartId: 1,
            stationEndId: 2,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-02'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-02'),
                    plannedArrival: new Date('2024-01-02'),
                    actualArrival: new Date('2024-01-02'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-01'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-01'),
                    plannedArrival: new Date('2024-01-01'),
                    actualArrival: new Date('2024-01-01'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        },
        {
            id: '2',
            plannedStart: new Date('2024-01-03'),
            plannedEnd: new Date('2024-01-04'),
            lineName: 'Line 2',
            name: 'Ride 2',
            stationStartId: 3,
            stationEndId: 4,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-04'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-04'),
                    plannedArrival: new Date('2024-01-04'),
                    actualArrival: new Date('2024-01-04'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-03'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-03'),
                    plannedArrival: new Date('2024-01-03'),
                    actualArrival: new Date('2024-01-03'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        }
    ];

    const sortedRides: TrainRideWithSectionsDto[] = [
        {
            id: '1',
            plannedStart: new Date('2024-01-01'),
            plannedEnd: new Date('2024-01-02'),
            lineName: 'Line 1',
            name: 'Ride 1',
            stationStartId: 1,
            stationEndId: 2,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-01'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-01'),
                    plannedArrival: new Date('2024-01-01'),
                    actualArrival: new Date('2024-01-01'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-02'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-02'),
                    plannedArrival: new Date('2024-01-02'),
                    actualArrival: new Date('2024-01-02'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        },
        {
            id: '2',
            plannedStart: new Date('2024-01-03'),
            plannedEnd: new Date('2024-01-04'),
            lineName: 'Line 2',
            name: 'Ride 2',
            stationStartId: 3,
            stationEndId: 4,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-03'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-03'),
                    plannedArrival: new Date('2024-01-03'),
                    actualArrival: new Date('2024-01-03'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-04'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date('2024-01-04'),
                    plannedArrival: new Date('2024-01-04'),
                    actualArrival: new Date('2024-01-04'),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        }
    ];

    const result = StationService.sortStationsInTrainRides(unsortedRides);
    assert(result.length === sortedRides.length);
    deepStrictEqual(result, sortedRides);
});

describe('StationService', () => {
    let stationService: StationService;

    beforeEach(() => {
        const dataAccess = {
            client: {
                trainRide: {

                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stationService = new StationService(dataAccess as DataAccessClient);
    });

    it('should return sorted train rides by station ID, date, and page', async () => {
        // Arrange
        const stationId = 1;
        const date = new Date('2024-01-01');
        const page = 0;

        const unsortedRides: TrainRideWithSectionsDto[] = [
            // Define your unsorted train rides here
        ];

        const sortedRides: TrainRideWithSectionsDto[] = [
            // Define your expected sorted train rides here
        ];

        // Mock the dataAccess.client.trainRide.findMany method
        stationService['dataAccess'].client.trainRide.findMany = jest.fn().mockResolvedValue(unsortedRides);

        // Mock the StationService.sortStationsInTrainRides method
        StationService.sortStationsInTrainRides = jest.fn().mockReturnValue(sortedRides);

        // Act
        const result = await stationService.getRidesByStationId(stationId, date, page);

        // Assert
        expect(stationService['dataAccess'].client.trainRide.findMany).toHaveBeenCalledWith(expect.objectContaining({
            skip: page * 20,
            take: 20
        }));

        expect(StationService.sortStationsInTrainRides).toHaveBeenCalledWith(unsortedRides);

    });
});