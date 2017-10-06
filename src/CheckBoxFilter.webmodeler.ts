import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";

import { Alert } from "./components/Alert";
import { CheckboxFilter } from "./components/CheckBoxFilter";
import { ContainerProps, ContainerState } from "./components/CheckBoxFilterContainer";
import { Utils, parseStyle } from "./utils/ContainerUtils";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, ContainerState> {
    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: true };
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            createElement(CheckboxFilter, {
                handleChange:  () => { return; },
                isChecked: this.props.defaultChecked
            })
        );
    }

    componentDidMount() {
        this.validateConfigs();
    }

    componentDidUpdate(_newProps: ContainerProps) {
        this.validateConfigs();
    }

    private validateConfigs() {
        // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = Utils.findTargetNode(routeNode);

        if (targetNode) {
            this.setState({ targetNode });
        }
        this.setState({ listViewAvailable: true });
    }

    private renderAlert() {
        const errorMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            isModeler: true,
            targetListView: this.state.targetListView
        });

        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message: errorMessage
        });
    }
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
    visibilityMap.attribute = valueMap.filterBy === "attribute";
    visibilityMap.attributeValue = valueMap.filterBy === "attribute";
    visibilityMap.constraint = valueMap.filterBy === "XPath";
    visibilityMap.unCheckedAttribute = valueMap.unCheckedFilterBy === "attribute";
    visibilityMap.unCheckedAttributeValue = valueMap.unCheckedFilterBy === "attribute";
    visibilityMap.unCheckedConstraint = valueMap.unCheckedFilterBy === "XPath";

    return visibilityMap;
}
