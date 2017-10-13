import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckBoxFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";

import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import "./ui/CheckBoxFilter.scss";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

export interface ContainerProps extends WrapperProps {
    listViewEntity: string;
    filterBy: FilterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    defaultChecked: boolean;
    unCheckedFilterBy: FilterOptions;
    unCheckedAttribute: string;
    unCheckedAttributeValue: string;
    unCheckedConstraint: string;
}

type FilterOptions = "attribute" | "XPath" | "None";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _pageObjs: mendix.lib.MxObject[];
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    __customWidgetDataSourceHelper: any;
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
}

export interface ContainerState {
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
    alertMessage?: string;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: any;
    constructor(props: ContainerProps) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        const alertMessage = Utils.validateProps(props);
        // if (!alertMessage) {
            // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render timing
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
        // }

        this.state = { listViewAvailable: false, alertMessage };
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
    //    this.setState({ alertMessage: this.validate(this.state.targetNode, this.state.targetListView) });
        this.applyFilter(nextProps.defaultChecked);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.applyFilter(this.props.defaultChecked);
        }
    }

    private renderAlert() {
        // const message = this.validate(this.state.targetNode, this.state.targetListView);
        // this.setState({ validationPassed: !!message });
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message: this.state.alertMessage
        });
    }

    private renderComponent(): ReactElement<CheckboxFilterProps> {
        if (!this.state.alertMessage) {
            return createElement(CheckboxFilter, {
                handleChange: this.applyFilter,
                isChecked: this.props.defaultChecked
            });
        }

        return null;
    }

    private getConstraint(isChecked: boolean) {
        const { targetListView } = this.state;
        // To support multiple filters. We attach each checkbox-filter-widget's selected constraint
        // On the listView's custom 'filter' object.
        if (targetListView && targetListView._datasource) {
            const attribute = isChecked ? this.props.attribute : this.props.unCheckedAttribute;
            const filterBy = isChecked ? this.props.filterBy : this.props.unCheckedFilterBy;
            const constraint = isChecked ? this.props.constraint : this.props.unCheckedConstraint;
            const attributeValue = isChecked ? this.props.attributeValue : this.props.unCheckedAttributeValue;

            if (filterBy === "XPath") {
                return constraint.indexOf(`[%CurrentObject%]'`) !== -1
                    ? constraint.replace(`'[%CurrentObject%]'`, this.props.mxObject.getGuid())
                    : constraint;
            } else if (filterBy === "attribute") {
                return this.getAttributeConstaint(attribute, attributeValue);
            } else {
               return "";
            }
        }
    }

    private getAttributeConstaint(attribute: string, attributeValue: string): string {
        const { targetListView } = this.state;
        if (targetListView && targetListView._datasource) {
            const mxObject = targetListView._datasource._pageObjs[0];
            if (mxObject && mxObject.isEnum(attribute)) {
                return `[${attribute}='${attributeValue.trim()}']`;
            } else if (mxObject && mxObject.isBoolean(attribute)) {
                return `[${attribute} = ${attributeValue.trim().toLowerCase()}()]`;
            } else {
                return `[contains(${attribute},'${attributeValue}')]`;
            }
        }
    }

/*
    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                targetListView.filter = targetListView.filter || {};
                this.setState({
                    alertMessage: this.validate(targetNode, targetListView),
                    listViewAvailable: !!targetListView,
                    targetListView,
                    targetNode
                });
            }
        }
    }
*/
    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                if (targetListView.__customWidgetDataSourceHelper) {
                    try {
                    targetListView.__customWidgetDataSourceHelper = new DataSourceHelper(targetListView);
                    } catch (error) {
                        // TODO show nice message message
                    }
                } else if (!DataSourceHelper.checkVersionCompatible(targetListView.__customWidgetDataSourceHelper.VERSION)) {
                    // TODO show nice message message
                }
                this.dataSourceHelper = targetListView.__customWidgetDataSourceHelper;
            }
        }
    }

    private applyFilter(isChecked: boolean) {
        // construct constraint based on checked
        const constraint = this.getConstraint(isChecked);
        if (this.dataSourceHelper)
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
    }

    /*private validate(filterNode: HTMLElement, targetListView: ListView) {
        return Utils.validateCompatibility({
            ...this.props as ContainerProps,
            filterNode,
            targetListView
        });
    }*/
}
