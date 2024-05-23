import { assert } from "console";
import { LineService } from "./line.service";
import { DataAccessClient } from "../database/data-access.client";
import { Line } from "@prisma/client";



describe(LineService.name, () => {
    it('should return a list of lines', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        const linesInDb: Line[] = [
            {
                name: 'Line 1',
                trainType: 'express',
                operator: 'SBB',
            },
        ];

        lineService['dataAccess'].client.line.findMany = jest.fn().mockResolvedValue(linesInDb);

        const lines = await lineService.getLines();

        assert(lines.length === 1);
        assert(lines[0] == linesInDb[0]);
    });

    it('should return an empty list of lines', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        const linesInDb: Line[] = [];

        lineService['dataAccess'].client.line.findMany = jest.fn().mockResolvedValue(linesInDb);

        const lines = await lineService.getLines();

        assert(lines.length === 0);
    });

    it('should throw an error', async () => {
        const dataAccess = new DataAccessClient();
        const lineService = new LineService(dataAccess);

        lineService['dataAccess'].client.line.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

        try {
            await lineService.getLines();
            assert(false);
        } catch (error: unknown) {
            if (error instanceof Error) {
                assert(error.message === 'Database error');
            } else {
                assert(false);
            }
        }
    });

    describe('mergeLineSections', () => {
        it('should merge line sections correctly', () => {
            const trainRides: ({ sections: { plannedDeparture: Date | null; actualDeparture: Date | null; plannedArrival: Date | null; actualArrival: Date | null; }[]; } & { id: string; lineName: string; name: string; stationStartId: number; stationEndId: number; plannedStart: Date | null; plannedEnd: Date | null; })[] = [
                {
                    id: '1',
                    lineName: 'Line 1',
                    name: 'Train Ride 1',
                    stationStartId: 1,
                    stationEndId: 2,
                    plannedStart: new Date('2022-01-01T10:00:00Z'),
                    plannedEnd: new Date('2022-01-01T12:00:00Z'),
                    sections: [
                        {
                            plannedDeparture: new Date('2022-01-01T10:00:00Z'),
                            actualDeparture: new Date('2022-01-01T10:05:00Z'),
                            plannedArrival: new Date('2022-01-01T11:00:00Z'),
                            actualArrival: new Date('2022-01-01T11:05:00Z'),
                        },
                        {
                            plannedDeparture: new Date('2022-01-01T11:00:00Z'),
                            actualDeparture: new Date('2022-01-01T11:05:00Z'),
                            plannedArrival: new Date('2022-01-01T12:00:00Z'),
                            actualArrival: new Date('2022-01-01T12:05:00Z'),
                        },
                    ],
                },
                {
                    id: '2',
                    lineName: 'Line 1',
                    name: 'Train Ride 2',
                    stationStartId: 2,
                    stationEndId: 3,
                    plannedStart: new Date('2022-01-01T12:00:00Z'),
                    plannedEnd: new Date('2022-01-01T14:00:00Z'),
                    sections: [
                        {
                            plannedDeparture: new Date('2022-01-01T12:00:00Z'),
                            actualDeparture: new Date('2022-01-01T12:05:00Z'),
                            plannedArrival: new Date('2022-01-01T13:00:00Z'),
                            actualArrival: new Date('2022-01-01T13:05:00Z'),
                        },
                        {
                            plannedDeparture: new Date('2022-01-01T13:00:00Z'),
                            actualDeparture: new Date('2022-01-01T13:05:00Z'),
                            plannedArrival: new Date('2022-01-01T14:00:00Z'),
                            actualArrival: new Date('2022-01-01T14:05:00Z'),
                        },
                    ],
                },
            ];

            const expectedMergedSections = [
                {
                    id: '1',
                    lineName: 'Line 1',
                    name: 'Train Ride 1',
                    stationStartId: 1,
                    stationEndId: 2,
                    plannedStart: new Date('2022-01-01T10:00:00Z'),
                    plannedEnd: new Date('2022-01-01T12:00:00Z'),
                    sections: [
                        {
                            plannedDeparture: new Date('2022-01-01T10:00:00Z'),
                            actualDeparture: new Date('2022-01-01T10:05:00Z'),
                            plannedArrival: new Date('2022-01-01T11:00:00Z'),
                            actualArrival: new Date('2022-01-01T11:05:00Z'),
                        },
                        {
                            plannedDeparture: new Date('2022-01-01T11:00:00Z'),
                            actualDeparture: new Date('2022-01-01T11:05:00Z'),
                            plannedArrival: new Date('2022-01-01T12:00:00Z'),
                            actualArrival: new Date('2022-01-01T12:05:00Z'),
                        },
                        {
                            plannedDeparture: new Date('2022-01-01T12:00:00Z'),
                            actualDeparture: new Date('2022-01-01T12:05:00Z'),
                            plannedArrival: new Date('2022-01-01T13:00:00Z'),
                            actualArrival: new Date('2022-01-01T13:05:00Z'),
                        },
                        {
                            plannedDeparture: new Date('2022-01-01T13:00:00Z'),
                            actualDeparture: new Date('2022-01-01T13:05:00Z'),
                            plannedArrival: new Date('2022-01-01T14:00:00Z'),
                            actualArrival: new Date('2022-01-01T14:05:00Z'),
                        },
                    ],
                },
            ];

            const mergedSections = LineService.mergeLineSections(trainRides);

            expect(mergedSections).toEqual(expectedMergedSections);
        });
    });
});