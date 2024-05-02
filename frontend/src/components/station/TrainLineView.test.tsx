import '../../test/matchMedia.mock';
import React from "react";
import { render, screen } from "@testing-library/react";
import TrainLineView from "./TrainLineView";
import { TrainLineViewProps } from "../../model/props/TrainLineViewProps";


const props: TrainLineViewProps = {
    selected: true,
    onSelect: () => { },
    name: "Test",
    lineName: "Test Line",
    sections: [
        {
            stationFrom: {
                "id": 8506000,
                "description": "Test Station 1",
                "lon": 0,
                "lat": 0
            },
            stationTo: {
                "id": 8506001,
                "description": "Test Station 2",
                "lon": 0,
                "lat": 0
            },
            plannedDeparture: "2024-05-01T11:29:00.000Z",
            actualDeparture: "2024-05-01T12:04:00.000Z",
            plannedArrival: "2024-05-01T12:01:00.000Z",
            actualArrival: "2024-05-01T12:34:00.000Z",
            averageDepartureDelay: 35,
            averageArrivalDelay: 33
        },
    ],
    filterDate: new Date()
};

describe("TrainLineView", () => {
    it("renders the line name", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByTestId("line-name");
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders the station name", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText("Test Station 1");
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders the planned departure", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText("11:29");
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders the planned arrival", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText("12:01");
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders the difference of the actual arrival and the planned arrival", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText((content) => content.includes("+35"));
        expect(stationNameElement).toBeInTheDocument();
    });

    it("renders the difference of the actual departure and the planned departure", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText((content) => content.includes("+33"));
        expect(stationNameElement).toBeInTheDocument();
    });

    it("shows date", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText((content) => content.includes("02.05.2024"));
        expect(stationNameElement).toBeInTheDocument();
    });

    it("shows train line name", () => {
        render(<TrainLineView {...props} />);
        const stationNameElement = screen.getByText("Test Line");
        expect(stationNameElement).toBeInTheDocument();
    });

});
