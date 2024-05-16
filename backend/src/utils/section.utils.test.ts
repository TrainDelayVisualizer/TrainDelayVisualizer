import { Section, TrainRide } from "@prisma/client";
import { SectionUtils } from "./section.utils";

describe(SectionUtils.name, () => {
    

    it('should calculate the average delay of 0 in seconds for train rides with sections', () => {
        const trainRidesWithSections: ({ sections: Section[]; } & TrainRide)[] = [
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

        const averageDelaySeconds = SectionUtils.calculateAverageDelaySeconds(trainRidesWithSections);
        expect(averageDelaySeconds).toEqual({ arrival: 0, departure: 0 });
    });


    it('should calculate the average delay of 20 in seconds for train rides with sections', () => {
        const trainRidesWithSections: ({ sections: Section[]; } & TrainRide)[] = [
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
                        isDelay: true,
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
                        stationFromId: 0,
                        stationToId: 0,
                        plannedDeparture: new Date('2024-01-04'),
                        actualDeparture: new Date('2024-01-04'),
                        plannedArrival: new Date('2024-01-04 00:03:10'),
                        actualArrival: new Date('2024-01-04 00:03:50'),
                        isDelay: true,
                        isCancelled: false,
                        trainRideId: '0'
                    }
                ]
            }
        ];

        const averageDelaySeconds = SectionUtils.calculateAverageDelaySeconds(trainRidesWithSections);
        expect(averageDelaySeconds).toEqual({ arrival: 20, departure: 0 }); // Replace with the expected average delay in minutes

    });

    describe('calculateArrivalDelayForSection', () => {
        it('should calculate delay based on actualArrival and plannedArrival', () => {
            const section: Section = {
                plannedDeparture: new Date('2024-01-01'),
                plannedArrival: new Date('2024-01-01'),
                actualDeparture: null,
                actualArrival: new Date('2024-01-01T00:01:00'),
                isDelay: false,
                isCancelled: false,
                trainRideId: '0',
                stationFromId: 0,
                stationToId: 0
            };

            const delay = SectionUtils.calculateArrivalDelayForSection(section);

            expect(delay).toBe(60);
        });

        it('should calculate delay based on actualArrival and plannedArrival', () => {
            const section: Section = {
                plannedDeparture: new Date('2024-01-01'),
                plannedArrival: new Date('2024-01-01'),
                actualDeparture: null,
                actualArrival: new Date('2024-01-01T00:00:13'),
                isDelay: false,
                isCancelled: false,
                trainRideId: '0',
                stationFromId: 0,
                stationToId: 0
            };

            const arrivalDelay = SectionUtils.calculateArrivalDelayForSection(section);

            expect(arrivalDelay).toBe(13);
        });

        it('should calculate delay based on actualArrival and plannedArrival, actualArrival is null', () => {
            const section: Section = {
                plannedDeparture: new Date('2024-01-01'),
                plannedArrival: new Date('2024-01-01'),
                actualDeparture: null,
                actualArrival: null,
                isDelay: false,
                isCancelled: false,
                trainRideId: '0',
                stationFromId: 0,
                stationToId: 0
            };

            const arrivalDelay = SectionUtils.calculateArrivalDelayForSection(section);

            expect(arrivalDelay).toBe(0);
        });

        it('should calculate delay based on actualDeparture and plannedDeparture, actualDeparture is null', () => {
            const section: Section = {
                plannedDeparture: new Date('2024-01-01'),
                plannedArrival: new Date('2024-01-01'),
                actualDeparture: null,
                actualArrival: null,
                isDelay: false,
                isCancelled: false,
                trainRideId: '0',
                stationFromId: 0,
                stationToId: 0
            };

            const departureDelay = SectionUtils.calculateDepartureDelayForSection(section);

            expect(departureDelay).toBe(0);
        });

        it('should calculate delay based on actualDeparture and plannedDeparture', () => {
            const section: Section = {
                plannedDeparture: new Date('2024-01-01'),
                plannedArrival: new Date('2024-01-01'),
                actualDeparture: new Date('2024-01-01T00:00:44'),
                actualArrival: null,
                isDelay: false,
                isCancelled: false,
                trainRideId: '0',
                stationFromId: 0,
                stationToId: 0
            };

            const departureDelay = SectionUtils.calculateDepartureDelayForSection(section);

            expect(departureDelay).toBe(44);
        });
    });
});