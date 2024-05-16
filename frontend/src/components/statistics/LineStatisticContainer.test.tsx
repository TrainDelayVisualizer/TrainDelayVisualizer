/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LineStatisticContainer from "./LineStatisticContainer";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { getEndOfDayYesterday, getMidnightYesterday } from "../../util/date.util";
import dayjs from "dayjs";
import { LineStatisticDto } from "../../model/LineStatstic";
import store from "../../store/store";

//const mockLines = ["U1", "U2", "U3"];
const mockLineStatistics: LineStatisticDto[] = [
    { name: "U1", averageArrivalDelaySeconds: 120, averageDepartureDelaySeconds: 60, sectionsCount: 0 },
    { name: "U2", averageArrivalDelaySeconds: 30, averageDepartureDelaySeconds: 15, sectionsCount: 0 },
];


describe("LineStatisticContainer", () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockLineStatistics)
        } as any);
        jest.spyOn(require('../../store/lineSlice'), 'fetchLines').mockReturnValue(jest.fn());
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // Deprecated
                removeListener: jest.fn(), // Deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    it("renders the component", () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <LineStatisticContainer />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByTestId("table-container-title")).toBeInTheDocument();
    });

    it("fetches and displays line statistics", async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <LineStatisticContainer />
                </BrowserRouter>
            </Provider>
        );

        expect(fetch).toHaveBeenCalledWith(
            `http://localhost:4000/api/statistic/line?from=${dayjs(getMidnightYesterday()).startOf('day').toISOString()}&to=${dayjs(getEndOfDayYesterday()).endOf('day').toISOString()}&lineName=`
        );

        await screen.findByText("2 results found");

        expect(screen.getAllByTestId("line-name")[0]).toHaveTextContent(mockLineStatistics[0].name);
    });
});