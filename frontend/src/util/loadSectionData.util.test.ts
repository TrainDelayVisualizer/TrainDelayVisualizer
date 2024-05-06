import { loadSectionData } from "./loadSectionData.util";
import store from "../store/store";

jest.mock("../store/store", () => ({
    getState: () => ({
        station: {
            allById: {
                8503129: { id: 8503129, name: "Wallisellen" },
                8503110: { id: 8503110, name: "Rapperswil SG" },
            }
        }
    })
}));

describe("loadSectionData", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    it("should return correctly and calculate average departure and arrival delay for each section", async () => {
        const abortSignal: AbortSignal = new AbortController().signal;
        const filter: Date = new Date("2024-01-01");
        const rapperswilStationId: number = 8503110;
        const page: number = 0;

        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({
                results: [
                    {
                        "id": "ch:1:sjyid:100001:88891-001",
                        "lineName": "S8",
                        "name": "Wallisellen → Rapperswil SG",
                        "stationStartId": 8503129,
                        "stationEndId": 8503110,
                        "plannedStart": "2024-05-05T21:26:00.000Z",
                        "plannedEnd": "2024-05-05T22:29:00.000Z",
                        "sections": [
                            {
                                "plannedArrival": "2024-05-05T22:00:00.000Z",
                                "plannedDeparture": "2024-05-05T21:26:00.000Z",
                                "actualArrival": "2024-05-05T22:05:00.000Z",
                                "actualDeparture": "2024-05-05T21:30:00.000Z",
                                "stationFromId": 8503129,
                                "stationToId": 8503110
                            }
                        ]
                    }
                ],
                count: 1
            })
        });

        const expectedRide = {
            trainRides: [
                {
                    name: "Wallisellen → Rapperswil SG",
                    lineName: "S8",
                    plannedStart: "2024-05-05T21:26:00.000Z",
                    sections: [
                        {
                            plannedArrival: "2024-05-05T22:00:00.000Z",
                            plannedDeparture: "2024-05-05T21:26:00.000Z",
                            actualArrival: "2024-05-05T22:05:00.000Z",
                            actualDeparture: "2024-05-05T21:30:00.000Z",
                            stationFrom: { id: 8503129, name: "Wallisellen" },
                            stationTo: { id: 8503110, name: "Rapperswil SG" },
                            averageDepartureDelay: 4,
                            averageArrivalDelay: 5,
                        }
                    ]
                }
            ],
            count: 1
        };

        const result = await loadSectionData(abortSignal, filter, rapperswilStationId, page);
        expect(result).toEqual(expectedRide);
    });

    it("should reject the promise if fetch fails", async () => {
        const abortSignal: AbortSignal = new AbortController().signal;
        const filter: Date = new Date("2024-01-01");
        const rapperswilStationId: number = 8503110;
        const page: number = 0;

        (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));
        await expect(loadSectionData(abortSignal, filter, rapperswilStationId, page)).rejects.toThrow("Fetch failed");
    });
});
