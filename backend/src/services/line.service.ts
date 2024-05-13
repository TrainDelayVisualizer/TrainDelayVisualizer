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

    public async getStatisticsForLine(date: Date, lineName?: string): Promise<LineStatistic[]> {
        if (lineName) {
            return await this.dataAccess.client.lineStatistic.findMany({
                where: {
                    date: DateUtils.getMidnight(date),
                    name: lineName,
                },
                orderBy: {
                    averageArrivalDelaySeconds: 'desc',
                }
            });
        }
        return await this.dataAccess.client.lineStatistic.findMany({
            where: {
                date: DateUtils.getMidnight(date),
            },
            orderBy: {
                averageArrivalDelaySeconds: 'desc',
            }
        });
    }

    public async createLineStatisticForToday() {
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
                }
            });
            const existingLineStatisticsForToday = await tx.lineStatistic.findMany({
                where: {
                    date: date,
                }
            });

            logger.info(`Found ${lines.length} lines and ${existingLineStatisticsForToday.length} existing LineStatistics for ${date}. Comparing...`);

            const calculatedLineStatisticItems: LineStatistic[] = [];
            for (const line of lines) {
                const allSectionsOfLine = line.trainRides.flatMap(trainRide => trainRide.sections);
                const delayForSections = SectionUtils.calculateDelayForSections(allSectionsOfLine);
                const lineStatistic = {
                    name: line.name,
                    date: date as unknown as Date,
                    averageArrivalDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.arrivalDelay),
                    averageDepartureDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.departureDelay),
                } as LineStatistic;
                calculatedLineStatisticItems.push(lineStatistic);

            }
            const [newLineStatisticItems, existingLineStatisticsWithChanges] =
                DataUtils.splitIntoNewAndExistingItemsWithChanges(calculatedLineStatisticItems, existingLineStatisticsForToday, x => `${x.date}-${x.name}`);

            logger.info(`Creating ${newLineStatisticItems.length} new LineStatistics and updating ${existingLineStatisticsWithChanges.length} existing LineStatistics for ${date}.`);
            await tx.lineStatistic.createMany({
                data: newLineStatisticItems,
            });

            for (const chunk of ListUtils.chunk(existingLineStatisticsWithChanges, 50)) {
                await Promise.all(chunk.map(async dataItem =>
                    tx.lineStatistic.update({
                        where: {
                            name_date: {
                                date: dataItem.date,
                                name: dataItem.name,
                            },
                        },
                        data: dataItem
                    })));
            }
            logger.info(`Import statistic for LineStatistics done.`);
        });
    }
}