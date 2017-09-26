import { createElement } from "react";
import { shallow } from "enzyme";

import { Alert } from "../Alert";

describe("Alert", () => {
    it("renders the structure correctly", () => {
        const message = "This is an error";
        const alert = shallow(createElement(Alert, { bootstrapStyle: "danger", message }));

        expect(alert).toBeElement(
            createElement("div", { className: "alert alert-danger" }, message)
        );
    });

    it("renders no structure when the alert message is not specified", () => {
        const alert = shallow(createElement(Alert, { bootstrapStyle: "danger" }));

        expect(alert).toBeElement(null);
    });

    it("renders with the specified class name", () => {
        const message = "This is an error";
        const className = "widget-dropdown-filter";
        const alert = shallow(createElement(Alert, { bootstrapStyle: "danger", message, className }));

        expect(alert).toBeElement(
            createElement("div", { className: "alert alert-danger widget-dropdown-filter" }, message)
        );
    });
});
