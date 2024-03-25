import { assert } from "console";
import { TrainRideWithSectionsDto } from "../model/trainride.dto";
import { deepStrictEqual } from 'assert';
import { StationService } from "./station.service";

it('should sort all the stations in each train ride based on plannedDeparture', () => {
    const unsortedRides: TrainRideWithSectionsDto[] = [
        {
            id: '1',
            plannedStart: new Date(),
            plannedEnd: new Date(),
            lineName: 'Line 1',
            name: 'Ride 1',
            stationStartId: 1,
            stationEndId: 2,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-02'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-01'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        },
        {
            id: '2',
            plannedStart: new Date(),
            plannedEnd: new Date(),
            lineName: 'Line 2',
            name: 'Ride 2',
            stationStartId: 3,
            stationEndId: 4,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-04'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-03'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
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
            plannedStart: new Date(),
            plannedEnd: new Date(),
            lineName: 'Line 1',
            name: 'Ride 1',
            stationStartId: 1,
            stationEndId: 2,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-01'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-02'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                }
            ]
        },
        {
            id: '2',
            plannedStart: new Date(),
            plannedEnd: new Date(),
            lineName: 'Line 2',
            name: 'Ride 2',
            stationStartId: 3,
            stationEndId: 4,
            sections: [
                {
                    plannedDeparture: new Date('2024-01-03'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
                    isDelay: false,
                    isCancelled: false,
                    trainRideId: '0'
                },
                {
                    plannedDeparture: new Date('2024-01-04'),
                    stationFromId: 0,
                    stationToId: 0,
                    actualDeparture: new Date(),
                    plannedArravial: new Date(),
                    actualArrival: new Date(),
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