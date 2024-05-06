import { Station } from "./Station";

describe('Station', () => {
    it('should create a valid Station object', () => {
        const station: Station = {
            id: 1,
            description: 'Station A',
            lon: 0,
            lat: 0,
        };

        expect(station).toEqual({
            id: 1,
            description: 'Station A',
            lon: 0,
            lat: 0,
        });
    });
});