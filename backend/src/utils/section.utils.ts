import { Section } from "@prisma/client";

export class SectionUtils {

    static calculateAverageDelaySeconds(trainRidesWithSections: ({ sections: Section[]; })[]): { arrival: number, departure: number; } {
        let totalArrivalDelay = 0;
        let totalDepartureDelay = 0;
        let totalRides = 0;
        trainRidesWithSections.forEach(ride => {
            const { arrivalDelay, departureDelay } = SectionUtils.calculateDelayForSections(ride.sections);
            totalArrivalDelay += arrivalDelay;
            totalDepartureDelay += departureDelay;
            totalRides += ride.sections.length;
        });
        return {
            arrival: SectionUtils.calculateAverageDelay(totalRides, totalArrivalDelay),
            departure: SectionUtils.calculateAverageDelay(totalRides, totalDepartureDelay)
        };
    }

    static calculateAverageDelay(totalRides: number, totalArrivalDelay: number): number {
        return totalRides > 0 && totalArrivalDelay > 0 ? Math.round(totalArrivalDelay / totalRides) : 0;
    }

    static calculateDelayForSections(sections: {
        plannedDeparture: Date | null;
        actualDeparture: Date | null;
        plannedArrival: Date | null;
        actualArrival: Date | null;
    }[]) {
        let arrivalDelay = 0;
        let departureDelay = 0;
        sections.forEach(section => {
            const sectionArrivalDelay = this.calculateArrivalDelayForSection(section);
            const sectionDepartureDelay = this.calculateDepartureDelayForSection(section);
            arrivalDelay += Math.max(0, sectionArrivalDelay);
            departureDelay += Math.max(0, sectionDepartureDelay);
        });
        return { arrivalDelay, departureDelay };
    }

    static calculateArrivalDelayForSection(section: {
        plannedArrival: Date | null;
        actualArrival: Date | null;
    }) {
        if (section.actualArrival && section.plannedArrival) {
            return (section.actualArrival.getTime() - section.plannedArrival.getTime()) / 1000;
        }
        return 0;
    }

    static calculateDepartureDelayForSection(section: {
        plannedDeparture: Date | null;
        actualDeparture: Date | null;
    }) {
        if (section.actualDeparture && section.plannedDeparture) {
            return (section.actualDeparture.getTime() - section.plannedDeparture.getTime()) / 1000;
        }
        return 0;
    }
}