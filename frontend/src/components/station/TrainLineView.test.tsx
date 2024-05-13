import '../../test/matchMedia.mock';
import React from "react";
import { render, screen } from "@testing-library/react";
import TrainLineView, { calcSectionDelays } from "./TrainLineView";
import { TrainLineViewProps } from "../../model/props/TrainLineViewProps";


const section1 = {
    "id": 8506000,
    "description": "Test Station 1",
    "lon": 0,
    "lat": 0
};
const section2 = {
    "id": 8506001,
    "description": "Test Station 2",
    "lon": 0,
    "lat": 0
};
const props: TrainLineViewProps = {
    selected: true,
    onSelect: () => { },
    name: "Test",
    lineName: "Test Line",
    sections: [
        {
            stationFrom: section1,
            stationTo: section2,
            isCancelled: false,
            plannedDeparture: "2024-05-01T11:29:00.000Z",
            actualDeparture: "2024-05-01T12:04:00.000Z",
            plannedArrival: "2024-05-01T12:01:00.000Z",
            actualArrival: "2024-05-01T12:34:00.000Z",
            averageDepartureDelay: 35,
            averageArrivalDelay: 33
        },
    ],
    filterDate: new Date("2024-05-02")
};

describe("TrainLineView", () => {
    it("renders the line name", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByTestId("line-name");
        expect(element).toBeInTheDocument();
    });

    it("renders the station name", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText("Test Station 1");
        expect(element).toBeInTheDocument();
    });

    it("renders the planned departure", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText("11:29");
        expect(element).toBeInTheDocument();
    });

    it("renders the planned arrival", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText("12:01");
        expect(element).toBeInTheDocument();
    });

    it("renders the difference of the actual arrival and the planned arrival", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText((content) => content.includes("+35"));
        expect(element).toBeInTheDocument();
    });

    it("renders the difference of the actual departure and the planned departure", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText((content) => content.includes("+33"));
        expect(element).toBeInTheDocument();
    });

    it("shows date", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText((content) => content.includes("02.05.2024"));
        expect(element).toBeInTheDocument();
    });

    it("shows train line name", () => {
        render(<TrainLineView {...props} />);
        const element = screen.getByText("Test Line");
        expect(element).toBeInTheDocument();
    });

    it("should calcAverageDelays correctly, single section", () => {
        const sections = props.sections;
        const res = calcSectionDelays(sections);
        expect(res.arrivalN).toBe(1);
        expect(res.departureN).toBe(1);
        expect(res.arrivalSum).toBe(33);
        expect(res.departureSum).toBe(35);
    });

    it("should calcAverageDelays correctly, multiple sections", () => {
        const someSection = props.sections[0];
        const sections = [
            {
                ...someSection,
                averageDepartureDelay: 2,
                averageArrivalDelay: 1
            },
            {
                ...someSection,
                averageDepartureDelay: 3,
                averageArrivalDelay: 3
            },
            {
                ...someSection,
                averageDepartureDelay: 4,
                averageArrivalDelay: 2
            },
        ];
        const res = calcSectionDelays(sections);
        expect(res.departureN).toBe(3);
        expect(res.departureSum).toBe(9);
        expect(res.arrivalN).toBe(3);
        expect(res.arrivalSum).toBe(6);
    });

    it("should calcAverageDelays correctly, multiple sections with null", () => {
        const someSection = props.sections[0];
        const sections = [
            {
                ...someSection,
                averageDepartureDelay: 2,
                actualArrival: null
            },
            {
                ...someSection,
                actualDeparture: null,
                averageArrivalDelay: 3
            },
            {
                ...someSection,
                averageDepartureDelay: 4,
                averageArrivalDelay: 2
            },
        ];
        const res = calcSectionDelays(sections);
        expect(res.departureN).toBe(2);
        expect(res.departureSum).toBe(6);
        expect(res.arrivalN).toBe(2);
        expect(res.arrivalSum).toBe(5);
    });
});
