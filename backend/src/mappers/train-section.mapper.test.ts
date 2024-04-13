import { Section, TrainStation } from "@prisma/client";
import { TrainSectionDtoMapper } from "./train-section.mapper";
import { SectionSummaryDto } from "../model/section-summary.dto";

describe(TrainSectionDtoMapper.name, () => {

    describe('test caluclateDeparturesDelayMinutes', () => {
        it('should return 0 when plannedDeparture or actualDeparture is missing', () => {
            const section = {
                plannedArrival: new Date('2024-01-01'),
                actualArrival: null
            } as Section;

            const result = TrainSectionDtoMapper.caluclateDeparturesDelayMinutes(section);

            expect(result).toBe(0);
        });

        it('should return the correct delay in minutes when both plannedDeparture and actualDeparture are provided', () => {
            const section = {
                plannedDeparture: new Date('2024-01-01T10:00:00'),
                actualDeparture: new Date('2024-01-01T10:15:00')
            } as Section;

            const result = TrainSectionDtoMapper.caluclateDeparturesDelayMinutes(section);

            expect(result).toBe(15);
        });
    });

    describe('test calculateArrivalDelayMinutes', () => {
        it('should return 0 when plannedArrival or actualArrival is missing', () => {
            const section = {
                plannedArrival: new Date('2024-01-01'),
                actualArrival: null
            } as Section;

            const result = TrainSectionDtoMapper.calculateArrivalDelayMinutes(section);

            expect(result).toBe(0);
        });

        it('should return the correct delay in minutes when both plannedArrival and actualArrival are provided', () => {
            const section = {
                plannedArrival: new Date('2024-01-01T10:00:00'),
                actualArrival: new Date('2024-01-01T10:15:00')
            } as Section;

            const result = TrainSectionDtoMapper.calculateArrivalDelayMinutes(section);

            expect(result).toBe(15);
        });
    });

    describe('test mapSameSectionsToSectionSummaryDto', () => {

        it('should return the correct SectionSummaryDto with average departure and arrival delays', () => {
            const sameSections: (Section & { stationFrom: TrainStation, stationTo: TrainStation })[] = [
                {
                    plannedArrival: new Date('2024-01-01T10:00:00'),
                    actualArrival: new Date('2024-01-01T10:10:00'),
                    plannedDeparture: new Date('2024-01-01T10:00:00'),
                    actualDeparture: new Date('2024-01-01T10:05:00'),
                    stationFrom: { description: 'Station A' },
                    stationTo: { description: 'Station B' }
                } as Section & { stationFrom: TrainStation, stationTo: TrainStation },
                {
                    plannedArrival: new Date('2024-01-01T11:00:00'),
                    actualArrival: new Date('2024-01-01T11:20:00'),
                    plannedDeparture: new Date('2024-01-01T11:00:00'),
                    actualDeparture: new Date('2024-01-01T11:05:00'),
                    stationFrom: { description: 'Station A' },
                    stationTo: { description: 'Station B' }
                } as Section & { stationFrom: TrainStation, stationTo: TrainStation }
            ];

            const result = TrainSectionDtoMapper.mapSameSectionsToSectionSummaryDto(sameSections);

            expect(result).toEqual({
                stationFrom: { description: 'Station A' },
                stationTo: { description: 'Station B' },
                averageDepartureDelay: 5,
                averageArrivalDelay: 15
            } as SectionSummaryDto);
        });
    });
});