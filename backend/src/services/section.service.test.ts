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
                trainLine: 'Line A'
            };

            const result = new SectionService(undefined as any).buildQueryBySectionFilter(filter);

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
                        name: filter.trainLine
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

            const result = new SectionService(undefined as any).buildQueryBySectionFilter(filter);

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
                delaysOnly: true
            };

            const result = new SectionService(undefined as any).buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    line: {
                        trainType: filter.trainType
                    }
                }
            } as Prisma.SectionWhereInput);
        });

        it('should return the correct where filter when only trainLine is not provided', () => {
            const filter = {
                from: new Date('2024-01-01'),
                to: new Date('2024-01-02'),
                trainLine: 'Line A',
                delaysOnly: true
            };

            const result = new SectionService(undefined as any).buildQueryBySectionFilter(filter);

            expect(result).toEqual({
                trainRide: {
                    plannedStart: {
                        gte: filter.from
                    },
                    plannedEnd: {
                        lte: filter.to
                    },
                    line: {
                        name: filter.trainLine
                    }
                }
            } as Prisma.SectionWhereInput);
        });
    });
});