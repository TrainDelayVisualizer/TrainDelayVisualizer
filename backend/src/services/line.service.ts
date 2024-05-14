import { Service } from "typedi";
import { Line, LineStatistic } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { SectionUtils } from "../utils/section.utils";
import { DateUtils } from "../utils/date.utils";

@Service()
export class LineService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getLines(): Promise<Line[]> {
        return await this.dataAccess.client.line.findMany();
    }

    public async getStatisticsForLine(from: Date, to: Date, lineName?: string): Promise<LineStatistic[]> {
        const lines = await this.dataAccess.client.line.findMany({
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
                name: lineName || undefined,
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
            const delayForSections = SectionUtils.calculateTotalDelayForSections(allSectionsOfLine);
            const lineStatistic = {
                name: line.name,
                averageArrivalDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.arrivalDelay),
                averageDepartureDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.departureDelay),
                sectionsCount: allSectionsOfLine.length,
            } as LineStatistic;
            calculatedLineStatisticItems.push(lineStatistic);
        }
        return calculatedLineStatisticItems;
    }
}