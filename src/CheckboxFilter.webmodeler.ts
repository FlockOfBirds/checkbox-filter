import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import { Alert } from "./components/Alert";

import { CheckboxFilter } from "./components/CheckboxFilter";
import { ContainerProps, ContainerState } from "./components/CheckboxFilterContainer";
import { Utils, parseStyle } from "./utils/ContainerUtils";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, ContainerState> {
    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            createElement(CheckboxFilter, {
                caption: this.props.caption,
                handleChange:  () => { return; },
                isChecked: this.props.defaultChecked
            })
        );
    }

    componentDidMount() {
        this.validateConfigs();
    }

    componentWillReceiveProps(_newProps: ContainerProps) {
        this.validateConfigs();
    }

    private validateConfigs() {
        // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = Utils.findTargetNode(routeNode);

        if (targetNode) {
            this.setState({ targetNode });
        }
        this.setState({ listviewAvailable: true });
    }

    private renderAlert() {
        const errorMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            isModeler: true,
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-checkbox-filter-alert",
            message: errorMessage
        });
    }
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
    if (valueMap.filterBy === "attribute") {
        visibilityMap.attribute = true;
        visibilityMap.attributeValue = true;
        visibilityMap.constraint = false;
    } else if (valueMap.filterBy === "XPath") {
        visibilityMap.attribute = false;
        visibilityMap.attributeValue = false;
        visibilityMap.constraint = true;
    } else {
        visibilityMap.attribute = false;
        visibilityMap.attributeValue = false;
        visibilityMap.constraint = false;
    }

    if (valueMap.unCheckedFilterBy === "attribute") {
        visibilityMap.unCheckedAttribute = true;
        visibilityMap.unCheckedAttributeValue = true;
        visibilityMap.unCheckedConstraint = false;
    } else if (valueMap.unCheckedFilterBy === "XPath") {
        visibilityMap.unCheckedAttribute = false;
        visibilityMap.unCheckedAttributeValue = false;
        visibilityMap.unCheckedConstraint = true;
    } else {
        visibilityMap.unCheckedAttribute = false;
        visibilityMap.unCheckedAttributeValue = false;
        visibilityMap.unCheckedConstraint = false;
    }

    return visibilityMap;
}
