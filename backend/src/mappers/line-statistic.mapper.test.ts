import { LineStatisticDto } from "../model/line-statistc.dto";
import { LineStatisticMapper } from "./line-statistic.mapper";

describe('LineStatisticMapper', () => {
    describe('mapTrainRidesToLineStatistic', () => {
        it('should map train rides to line statistics correctly', () => {
            // Arrange
            const trainRides = [
                {
                    lineName: 'Line 1',
                    sections: [
                        {
                            plannedDeparture: new Date('2022-01-01T10:00:00'),
                            actualDeparture: new Date('2022-01-01T10:05:00'),
                            plannedArrival: new Date('2022-01-01T11:00:00'),
                            actualArrival: new Date('2022-01-01T11:10:00'),
                        },
                        // Add more sections if needed
                    ],
                },
                // Add more train rides if needed
            ];

            // Act
            const result = LineStatisticMapper.mapTrainRidesToLineStatistic(trainRides);

            // Assert
            expect(result).toEqual([
                {
                    name: 'Line 1',
                    averageArrivalDelaySeconds: 600,
                    averageDepartureDelaySeconds: 300,
                    sectionsCount: 1,
                },
                // Add more expected line statistics if needed
            ] as LineStatisticDto[]);
        });
    });

    describe('mapTrainRideToLineStatistic', () => {
        it('should map train ride to line statistic correctly', () => {
            // Arrange
            const trainRide = {
                lineName: 'Line 1',
                sections: [
                    {
                        plannedDeparture: new Date('2022-01-01T10:00:00'),
                        actualDeparture: new Date('2022-01-01T10:05:00'),
                        plannedArrival: new Date('2022-01-01T11:00:00'),
                        actualArrival: new Date('2022-01-01T11:10:00'),
                    },
                    // Add more sections if needed
                ],
            };

            // Act
            const result = LineStatisticMapper.mapTrainRideToLineStatistic(trainRide);

            // Assert
            expect(result).toEqual({
                name: 'Line 1',
                averageArrivalDelaySeconds: 600,
                averageDepartureDelaySeconds: 300,
                sectionsCount: 1,
            } as LineStatisticDto);
        });
    });
});