import { Service } from "typedi";
import { Line, LineStatistic } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { SectionUtils } from "../utils/section.utils";
import { DataUtils } from "../utils/data.utils";
import { DateUtils } from "../utils/date.utils";
import { ListUtils } from "../utils/list.utils";
import logger from "../utils/logger.utils";

@Service()
export class LineService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getLines(): Promise<Line[]> {
        return await this.dataAccess.client.line.findMany();
    }

    public async getStatisticsForLine(from: Date, to: Date, lineName?: string): Promise<LineStatistic[]> {
        const where: { date: { gte: Date, lte: Date; }, name?: string; } = {
            date: {
                gte: DateUtils.getMidnight(from),
                lte: DateUtils.getMidnight(to),
            }
        };
        if (lineName) {
            where.name = lineName;
        }
        return await this.dataAccess.client.lineStatistic.findMany({
            where,
            orderBy: {
                averageArrivalDelaySeconds: 'desc',
            }
        });
    }

    public async createLineStatisticForLastDay(from: Date, to: Date) {
        await this.dataAccess.client.$transaction(async (tx) => {
            const date = DateUtils.subtractDays(DateUtils.getMidnight(new Date()), 1);
            logger.info(`Creating LineStatistic for ${date}`);
            const lines = await tx.line.findMany({
                include: {
                    trainRides: {
                        select: {
                            sections: {
                                select: {
                                    plannedArrival: true,
                                    plannedDeparture: true,
                                    actualArrival: true,
                                    actualDeparture: true,
                                }
                            }
                        }
                    }
                },
                where: {
                    trainRides: {
                        every: {
                            plannedStart: {
                                gte: DateUtils.getMidnight(from),
                                lte: DateUtils.getEndOfDay(to)
                            }
                        }
                    }
                }
            });

            const calculatedLineStatisticItems: LineStatistic[] = [];
            for (const line of lines) {
                const allSectionsOfLine = line.trainRides.flatMap(trainRide => trainRide.sections);
                const delayForSections = SectionUtils.calculateDelayForSections(allSectionsOfLine);
                const lineStatistic = {
                    name: line.name,
                    averageArrivalDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.arrivalDelay),
                    averageDepartureDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.departureDelay),
                    sectionsCount: allSectionsOfLine.length,
                } as LineStatistic;
                calculatedLineStatisticItems.push(lineStatistic);
            }
            return calculatedLineStatisticItems;
        });
    }
}