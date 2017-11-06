import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckBoxFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";
import { DataSourceHelper, ListView } from "../utils/DataSourceHelper/DataSourceHelper";

import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";

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
interface OfflineConstraint {
    attribute: string;
    operator: string;
    value: string;
    path?: string;
}

export interface ContainerState {
    alertMessage: string;
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private navigationHandler: object;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: false, alertMessage: Utils.validateProps(props) };
        this.applyFilter = this.applyFilter.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render timing
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
    }

    render() {
        // this.alertMessage = this.validate(this.props, this.state.targetListView) || this.alertMessage || "";
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(this.state.alertMessage),
            this.renderComponent()
        );
    }

    // componentWillUpdate(nextProps: ContainerProps, nextState: ContainerState) {
    //     // Added validation here to check especially for runtime errors like when
    //     // the widget is configured to listen to current object but mxObject is undefined
    //     this.alertMessage = this.validate(nextProps, nextState.targetListView);

    // }

    componentDidMount() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        DataSourceHelper.hideContent(targetNode);
        // this.dataSourceHelper = new DataSourceHelper(targetNode, null, this.props.friendlyId, DataSourceHelper.VERSION);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.applyFilter(this.props.defaultChecked);
        }
    }
    componentWillUnmount() {
        dojoConnect.disconnect(this.navigationHandler);
    }

    private renderAlert(message: string) {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message
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

    private applyFilter(isChecked: boolean) {
        const constraint = this.getConstraint(isChecked);
        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
    }

    private getConstraint(isChecked: boolean) {
        const { targetListView } = this.state;
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

    private getAttributeConstaint(attribute: string, attributeValue: string): string | OfflineConstraint {
        const { targetListView } = this.state;

        if (window.mx.isOffline()) {
            const constraints: OfflineConstraint = {
                attribute,
                operator: "contains",
                path: this.props.listViewEntity,
                value: attributeValue
            };
            return constraints;
        }
        if (targetListView && targetListView._datasource) {
            const entityMeta = mx.meta.getEntity(this.props.listViewEntity);

            if (entityMeta.isEnum(attribute)) {
                return `[${attribute}='${attributeValue.trim()}']`;
            } else if (entityMeta.isBoolean(attribute)) {
                return `[${attribute} = '${attributeValue.trim().toLowerCase()}']`;
            } else {
                return `[contains(${attribute},'${attributeValue}')]`;
            }
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;
        let errorMessage = "";

        if (targetNode) {
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                try {
                    this.dataSourceHelper = new DataSourceHelper(targetNode, targetListView, this.props.friendlyId, DataSourceHelper.VERSION);
                } catch (error) {
                    errorMessage = error.message;
                }

                this.setState({
                    alertMessage: errorMessage || Utils.validateCompatibility({
                        ...this.props as ContainerProps,
                        targetListView
                    }),
                    listViewAvailable: !!targetListView,
                    targetListView,
                    targetNode
                });
            }
        }
    }
}
