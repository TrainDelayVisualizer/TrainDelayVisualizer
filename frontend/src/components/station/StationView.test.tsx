import '../../test/matchMedia.mock';
import React from "react";
import { render, screen } from "@testing-library/react";
import StationView from "./StationView";
import { Station } from "../../model/Station";

const station: Station = {
    id: 1234,
    description: "Test Station",
    lon: 0,
    lat: 0,
};

describe("StationView", () => {
    it("renders the station name", () => {
        render(<StationView station={station} showSections={() => { }} />);
        const stationNameElement = screen.getByText("Test Station");
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders datepicker", () => {
        render(<StationView station={station} showSections={() => { }} />);
        const datePickerElement = screen.getByTestId("date-picker");
        expect(datePickerElement).toBeInTheDocument();
    });

    it("renders timepicker", () => {
        render(<StationView station={station} showSections={() => { }} />);
        const datePickerElement = screen.getByTestId("time-picker");
        expect(datePickerElement).toBeInTheDocument();
    });
});
