import React from "react";
import { render } from "@testing-library/react";
import NotFound from "./NotFound";

describe("NotFound", () => {
    it("should render 'Page not found'", () => {
        const { getByText } = render(<NotFound />);
        const pageNotFoundElement = getByText("Page not found");
        expect(pageNotFoundElement).toBeInTheDocument();
    });
});