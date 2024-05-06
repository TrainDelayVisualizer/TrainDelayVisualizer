import { loadSectionData } from "./loadSectionData.util";

describe("loadSectionData", () => {
    it("should calculate average departure and arrival delay for each section", () => {
        const abortSignal: AbortSignal = new AbortController().signal;
        const filter: Date = new Date("2024-01-01");
        const rapperswilStationId: number = 8503110;
        const page: number = 0;
        const ride = {
            "results": [
                {
                    "id": "ch:1:sjyid:100001:88891-001",
                    "lineName": "S8",
                    "name": "Wallisellen → Rapperswil SG",
                    "stationStartId": 8503129,
                    "stationEndId": 8503110,
                    "plannedStart": "2024-05-05T21:26:00.000Z",
                    "plannedEnd": "2024-05-05T22:29:00.000Z",
                    "sections": [
                        {}
                    ]
                }
            ]
        };

        const result = loadSectionData(abortSignal, filter, rapperswilStationId, page);

        expect(result).resolves.toEqual({ trainRides: [ride] });
    });

    it("should reject the promise if fetch fails", () => {
        const abortSignal: AbortSignal = new AbortController().signal;
        const filter: Date = new Date("2024-01-01");
        const rapperswilStationId: number = 8503110;
        const page: number = 0;

        const result = loadSectionData(abortSignal, filter, rapperswilStationId, page);

        expect(result).rejects.toBeTruthy();
    });

    it("should reject the promise if fetch is aborted", () => {
        const abortController = new AbortController();
        const abortSignal: AbortSignal = abortController.signal;
        const filter: Date = new Date("2024-01-01");
        const rapperswilStationId: number = 8503110;
        const page: number = 0;

        abortController.abort();

        const result = loadSectionData(abortSignal, filter, rapperswilStationId, page);

        expect(result).rejects.toThrow("AbortError");
    });
});
