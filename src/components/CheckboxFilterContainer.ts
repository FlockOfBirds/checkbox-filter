import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckboxFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";

import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform?: mxui.lib.form._FormBase;
}

export interface ContainerProps extends WrapperProps {
    listviewEntity: string;
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    defaultChecked: boolean;
    unCheckedFilterBy: filterOptions;
    unCheckedAttribute: string;
    unCheckedAttributeValue: string;
    unCheckedConstraint: string;
}


export type filterOptions = "attribute" | "XPath" | "None";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
    };
    filter: {
        [key: string ]: HybridConstraint | string;
    };
    update: () => void;
    _entity: string;
}

export interface ContainerState {
    listviewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        this.connectToListView = this.connectToListView.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView);
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderComponent()
        );
    }

    private renderAlert() {
        const message = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-checkbox-filter-alert",
            message
        });
    }

    private renderComponent(): ReactElement<CheckboxFilterProps> {
        if (this.state.validationPassed) {

            return createElement(CheckboxFilter, {
                caption: this.props.caption,
                handleChange: this.handleChange,
                isChecked: this.props.defaultChecked
            });
        }

        return null;
    }

    private handleChange(isChecked: boolean) {
        const { targetListView } = this.state;
        // To support multiple filters. We attach each checkbox-filter-widget's selected constraint
        // On the listView's custom 'filter' object.
        if (targetListView && targetListView._datasource) {
            const attribute = isChecked ? this.props.attribute : this.props.unCheckedAttribute;
            const filterBy = isChecked ? this.props.filterBy : this.props.unCheckedFilterBy;
            const constraint = isChecked ? this.props.attribute : this.props.unCheckedConstraint;
            const attributeValue = isChecked ? this.props.attributeValue : this.props.unCheckedAttributeValue;

            if (filterBy === "XPath") {
                targetListView.filter[this.props.friendlyId] = constraint;
            } else if (filterBy === "attribute") {
                targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${attributeValue}')]`;
            } else {
                targetListView.filter[this.props.friendlyId] = "";
            }

            // Combine multiple-filter constraints into one and apply it to the listview
            const finalConstraint = Object.keys(targetListView.filter)
                .map(key => targetListView.filter[key])
                .join("");
            targetListView._datasource._constraints = finalConstraint;
            targetListView.update();
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                targetListView.filter = {};
                this.setState({ targetListView });
            }
        }
        const validateMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: targetNode,
            targetListView,
            validate: true
        });
        this.setState({ listviewAvailable: false, validationPassed: !validateMessage });
    }
}
