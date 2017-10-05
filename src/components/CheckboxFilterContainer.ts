import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckboxFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";

import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import "./ui/CheckboxFilter.scss";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform?: mxui.lib.form._FormBase;
}

export interface ContainerProps extends WrapperProps {
    listviewEntity: string;
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
    initialConstraint: HybridConstraint | string;
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
}

export interface ContainerState {
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: true };
        this.applyFilter = this.applyFilter.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
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

    componentWillReceiveProps(nextProps: ContainerProps) {
        this.applyFilter(nextProps.defaultChecked);
    }

    private renderAlert() {
        const message = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            targetListView: this.state.targetListView
        });

        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message
        });
    }

    private renderComponent(): ReactElement<CheckboxFilterProps> {
        if (this.state.validationPassed) {

            return createElement(CheckboxFilter, {
                handleChange: this.applyFilter,
                isChecked: this.props.defaultChecked
            });
        }

        return null;
    }

    private applyFilter(isChecked: boolean) {
        const { targetListView, targetNode } = this.state;
        // To support multiple filters. We attach each checkbox-filter-widget's selected constraint
        // On the listView's custom 'filter' object.
        if (targetListView && targetListView._datasource) {
            this.showLoader(targetNode);
            const attribute = isChecked ? this.props.attribute : this.props.unCheckedAttribute;
            const filterBy = isChecked ? this.props.filterBy : this.props.unCheckedFilterBy;
            const constraint = isChecked ? this.props.constraint : this.props.unCheckedConstraint;
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
            targetListView._datasource._constraints = targetListView.initialConstraint + finalConstraint;
            // we have an issue with delayed update, that the grid sometimes initially displays unsorted content.
            // We might have to make these calls synchronous instead of async.
            targetListView.update(null, () => this.hideLoader(targetNode));
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
                targetListView.filter = targetListView.filter || {};
                if (targetListView.initialConstraint === undefined) {
                    targetListView.initialConstraint = targetListView._datasource._constraints;
                }
                this.setState({ targetListView, listViewAvailable: !!targetListView, targetNode });
            }
        }
        const validateMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: targetNode,
            targetListView
        });
        this.setState({ validationPassed: !validateMessage });
    }

    private showLoader(node?: HTMLElement) {
        if (node) {
            node.classList.add("widget-check-box-filter-loading");
        }
    }

    private hideLoader(node?: HTMLElement) {
        if (node) {
            node.classList.remove("widget-check-box-filter-loading");
        }
    }

}
