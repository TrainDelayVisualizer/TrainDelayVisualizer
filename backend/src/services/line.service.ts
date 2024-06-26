import { Service } from "typedi";
import { Line } from "@prisma/client";
import { DataAccessClient } from "../database/data-access.client";
import { DateUtils } from "../utils/date.utils";
import { LineStatisticMapper } from "../mappers/line-statistic.mapper";
import { sortBy } from "lodash";

@Service()
export class LineService {
    constructor(
        private readonly dataAccess: DataAccessClient,
    ) { }

    public async getLines(): Promise<Line[]> {
        return await this.dataAccess.client.line.findMany();
    }

    public async getStatisticsForLine(from: Date, to: Date, lineName?: string) {
        const trainRides = await this.dataAccess.client.trainRide.findMany({
            select: {
                lineName: true,
                sections: {
                    select: {
                        plannedArrival: true,
                        plannedDeparture: true,
                        actualArrival: true,
                        actualDeparture: true,
                    }
                }
            },
            where: {
                lineName: lineName || undefined,
                OR: [{
                    plannedStart: {
                        gte: DateUtils.getMidnight(from),
                        lte: DateUtils.getEndOfDay(to)
                    }
                },
                {
                    plannedEnd: {
                        gte: DateUtils.getMidnight(from),
                        lte: DateUtils.getEndOfDay(to)
                    }
                }]
            }
        });

        const trainRidesInput = LineService.mergeLineSections(trainRides);
        const mappedStatistic = LineStatisticMapper.mapTrainRidesToLineStatistic(trainRidesInput);
        return sortBy(mappedStatistic, x => -Math.max(x.averageArrivalDelaySeconds, x.averageDepartureDelaySeconds));
    }

    static mergeLineSections(trainRides: ({
        sections: {
            plannedDeparture: Date | null;
            actualDeparture: Date | null;
            plannedArrival: Date | null;
            actualArrival: Date | null;
        }[];
        lineName: string;
    })[]) {
        const groupedValues = new Map<string, typeof trainRides[0]>();
        for (const trainRide of trainRides) {
            const item = groupedValues.get(trainRide.lineName);
            if (item) {
                item.sections.push(...trainRide.sections);
            } else {
                groupedValues.set(trainRide.lineName, trainRide);
            }
        }
        const trainRidesInput = Array.from(groupedValues.values());
        return trainRidesInput;
    }
}