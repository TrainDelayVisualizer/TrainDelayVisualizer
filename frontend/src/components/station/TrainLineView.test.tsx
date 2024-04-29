import '../../test/matchMedia.mock';
import React from "react";
import { render, screen } from "@testing-library/react";
import StationView from "./StationView";
import TrainLineView from "./TrainLineView";
import { Station } from "../../store/stationSlice";

const trainLineViewProps: TrainLineViewProps = {
    key: 0,
    selected: false,
    name: "Test",
    lineName: "Test",
    sections: [],
    onSelect: () => { },
};

describe("TrainLineView", () => {
    it("renders the line name", () => {
        render(<TrainLineView />);
        const stationNameElement = screen.getByTestId("line-name");
        expect(stationNameElement).toBeInTheDocument();
    });

});
