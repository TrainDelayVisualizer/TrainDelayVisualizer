/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { SectionService } from "./section.service";

describe(SectionService.name, () => {
    describe('buildQueryBySectionFilter', () => {
        it('should return the correct where filter when all filter options are provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                delaysOnly: true,
                trainType: 'Express',
                trainLine: 'Line A',
                trainOperator: 'Operator X'
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    lineName: filter.trainLine,
                    line: {
                        trainType: filter.trainType,
                        operator: filter.trainOperator
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only required filter options are provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                delaysOnly: false
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only trainType is not provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                trainType: 'Express',
                trainOperator: 'Operator X',
                delaysOnly: true
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    line: {
                        trainType: filter.trainType,
                        operator: filter.trainOperator,
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only trainLine is not provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                trainLine: 'Line A',
                trainOperator: 'Operator X',
                delaysOnly: true
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    lineName: filter.trainLine,
                    line: {
                        operator: filter.trainOperator
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only trainOperator is not provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                trainType: 'Express',
                trainLine: 'Line A',
                delaysOnly: true
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    lineName: filter.trainLine,
                    line: {
                        trainType: filter.trainType
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only trainOperator is provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                trainOperator: 'Operator X',
                delaysOnly: true
            };

            const result = SectionService.buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    line: {
                        operator: filter.trainOperator
                    }
                }
            } as Prisma.SectionWhereInput);
        });
    });
});