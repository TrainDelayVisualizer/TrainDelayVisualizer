import React from "react";

import { render, screen } from "@testing-library/react";
import FilterView from "./FilterView";
import { Provider } from "react-redux";
import store from "../../store/store";

describe("FilterView", () => {

    it("renders fields", () => {
        render(
            <Provider store={store}>
                <FilterView closeDrawer={() => { }} />
            </Provider>
        );
        const datePickerElement = screen.getByTestId("date-picker");
        expect(datePickerElement).toBeInTheDocument();

        const lineElement = screen.getByTestId("line-select");
        expect(lineElement).toBeInTheDocument();

        const trainTypeElement = screen.getByTestId("train-type-select");
        expect(trainTypeElement).toBeInTheDocument();

        const operatorElement = screen.getByTestId("operator-select");
        expect(operatorElement).toBeInTheDocument();

        const fromTimeElement = screen.getByTestId("from-time");
        expect(fromTimeElement).toBeInTheDocument();

        const toTimeElement = screen.getByTestId("to-time");
        expect(toTimeElement).toBeInTheDocument();

        const filterBtnElement = screen.getByTestId("filter-btn");
        expect(filterBtnElement).toBeInTheDocument();
    });

    it("Shows date of yesterday initially", () => {
        render(
            <Provider store={store}>
                <FilterView closeDrawer={() => { }} />
            </Provider>
        );
        const datePickerElement = screen.getByTestId("date-picker");

        const date = new Date();
        const day = date.getDate() - 1; // yesterday
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const dateString = `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year}`;
        expect(datePickerElement).toHaveValue(dateString);
    });        
});