import { Section, SectionDTO } from "./Section";
import { TrainRide, TrainRideDTO } from "./TrainRide";

describe('TrainRide', () => {
    it('should create a valid TrainRide object', () => {
        const section1: Section = {
            stationFrom: { id: 1, description: 'Station A', lon: 0, lat: 0 },
            stationTo: { id: 2, description: 'Station B', lon: 0, lat: 0 },
            plannedArrival: '2022-01-01T10:00:00',
            plannedDeparture: '2022-01-01T10:30:00',
            actualDeparture: '2022-01-01T10:35:00',
            actualArrival: '2022-01-01T11:00:00',
            averageDepartureDelay: 5,
            averageArrivalDelay: 10,
        };

        const section2: Section = {
            stationFrom: { id: 2, description: 'Station B', lon: 0, lat: 0 },
            stationTo: { id: 3, description: 'Station C', lon: 0, lat: 0 },
            plannedArrival: '2022-01-01T11:00:00',
            plannedDeparture: '2022-01-01T11:30:00',
            actualDeparture: '2022-01-01T11:35:00',
            actualArrival: '2022-01-01T12:00:00',
            averageDepartureDelay: 5,
            averageArrivalDelay: 10,
        };

        const trainRide: TrainRide = {
            name: 'Train 123',
            lineName: 'Line A',
            sections: [section1, section2],
            plannedStart: '2022-01-01T10:00:00',
        };

        expect(trainRide).toEqual({
            name: 'Train 123',
            lineName: 'Line A',
            sections: [section1, section2],
            plannedStart: '2022-01-01T10:00:00',
        });
    });
});

describe('TrainRideDTO', () => {
    it('should create a valid TrainRideDTO object', () => {
        const sectionDTO1: SectionDTO = {
            stationFromId: 1,
            stationToId: 2,
            plannedArrival: '2022-01-01T10:00:00',
            plannedDeparture: '2022-01-01T10:30:00',
            actualDeparture: '2022-01-01T10:35:00',
            actualArrival: '2022-01-01T11:00:00',
        };

        const sectionDTO2: SectionDTO = {
            stationFromId: 2,
            stationToId: 3,
            plannedArrival: '2022-01-01T11:00:00',
            plannedDeparture: '2022-01-01T11:30:00',
            actualDeparture: '2022-01-01T11:35:00',
            actualArrival: '2022-01-01T12:00:00',
        };

        const trainRideDTO: TrainRideDTO = {
            name: 'Train 123',
            lineName: 'Line A',
            sections: [sectionDTO1, sectionDTO2],
            plannedStart: '2022-01-01T10:00:00',
        };

        expect(trainRideDTO).toEqual({
            name: 'Train 123',
            lineName: 'Line A',
            sections: [sectionDTO1, sectionDTO2],
            plannedStart: '2022-01-01T10:00:00',
        });
    });
});