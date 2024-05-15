import { LineStatisticDto } from "../model/line-statistc.dto";
import { SectionUtils } from "../utils/section.utils";

export class LineStatisticMapper {

    static mapTrainRidesToLineStatistic(trainRides: ({ sections: { plannedDeparture: Date | null; actualDeparture: Date | null; plannedArrival: Date | null; actualArrival: Date | null; }[]; } & { lineName: string; })[]) {
        return trainRides.map(ride => LineStatisticMapper.mapTrainRideToLineStatistic(ride));
    }

    static mapTrainRideToLineStatistic(trainRide: { sections: { plannedDeparture: Date | null; actualDeparture: Date | null; plannedArrival: Date | null; actualArrival: Date | null; }[]; } & { lineName: string; }) {
        const allSectionsOfLine = trainRide.sections.flatMap(s => s);
        const delayForSections = SectionUtils.calculateTotalDelayForSections(allSectionsOfLine);
        return {
            name: trainRide.lineName,
            averageArrivalDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.arrivalDelay),
            averageDepartureDelaySeconds: SectionUtils.calculateAverageDelay(allSectionsOfLine.length, delayForSections.departureDelay),
            sectionsCount: allSectionsOfLine.length,
        } as LineStatisticDto;
    }
}