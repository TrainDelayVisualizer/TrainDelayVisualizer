import { Station } from "./Station";
import { Section, SectionDTO } from "./Section";

describe('Section', () => {
    it('should create a valid Section object', () => {
        const stationFrom: Station = { id: 1, description: 'Station A', lon: 0, lat: 0 };
        const stationTo: Station = { id: 2, description: 'Station B', lon: 0, lat: 0 };
        const plannedArrival: string | null = '2022-01-01T10:00:00';
        const plannedDeparture: string | null = '2022-01-01T10:30:00';
        const actualDeparture: string | null = '2022-01-01T10:35:00';
        const actualArrival: string | null = '2022-01-01T11:00:00';
        const averageDepartureDelay: number = 5;
        const averageArrivalDelay: number = 10;

        const section: Section = {
            stationFrom,
            stationTo,
            plannedArrival,
            plannedDeparture,
            actualDeparture,
            actualArrival,
            averageDepartureDelay,
            averageArrivalDelay,
        };

        expect(section).toEqual({
            stationFrom,
            stationTo,
            plannedArrival,
            plannedDeparture,
            actualDeparture,
            actualArrival,
            averageDepartureDelay,
            averageArrivalDelay,
        });
    });
});

describe('SectionDTO', () => {
    it('should create a valid SectionDTO object', () => {
        const stationFromId: number = 1;
        const stationToId: number = 2;
        const plannedArrival: string | null = '2022-01-01T10:00:00';
        const plannedDeparture: string | null = '2022-01-01T10:30:00';
        const actualDeparture: string | null = '2022-01-01T10:35:00';
        const actualArrival: string | null = '2022-01-01T11:00:00';

        const sectionDTO: SectionDTO = {
            stationFromId,
            stationToId,
            plannedArrival,
            plannedDeparture,
            actualDeparture,
            actualArrival,
        };

        expect(sectionDTO).toEqual({
            stationFromId,
            stationToId,
            plannedArrival,
            plannedDeparture,
            actualDeparture,
            actualArrival,
        });
    });
});