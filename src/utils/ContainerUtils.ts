import { ContainerProps, ListView } from "../components/CheckboxFilterContainer";

export const parseStyle = (style = ""): {[key: string]: string} => {
    try {
        return style.split(";").reduce<{[key: string]: string}>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }
            return styleObject;
        }, {});
    } catch (error) {
        // tslint:disable-next-line no-console
        window.console.log("Failed to parse style", style, error);
    }

    return {};
};

export class Utils {
    static validate(props: ContainerProps & { filterNode: HTMLElement; targetListView: ListView; isModeler?: boolean}): string {
        const widgetName = props.friendlyId;
        const { targetListView } = props;
        const errorMessage = [];
        // validate filter values if filterby = attribute, then value should not be empty or "" or " ".
        if (!props.filterNode) {
            return `${widgetName}: unable to find a listview with to attach to`;
        }

        if (props.filterBy === "XPath" && !props.constraint) {
            errorMessage.push(`Filter by 'XPath' requires an 'XPath contraint'`);
        }
        if (props.filterBy === "attribute" && !props.attribute) {
            errorMessage.push(`Filter by 'Attribute' requires an 'Attribute'`);
        }
        if (props.filterBy === "attribute" && !props.attributeValue) {
            errorMessage.push(`Filter by 'Attribute' requires an 'Attribute value`);
        }
        if (props.unCheckedFilterBy === "XPath" && !props.unCheckedConstraint) {
            errorMessage.push(`Unchecked filter by 'XPath' requires an 'XPath contraint'`);
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttribute) {
            errorMessage.push(`Unchecked filter by 'Attribute' requires an 'Attribute'`);
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttributeValue) {
            errorMessage.push(`Unchecked filter by 'Attribute' requires an 'Attribute value`);
        }
        if (errorMessage.length) {
            return `${widgetName} : ${errorMessage.join(", ")}`;
        }

        if (props.isModeler) {
            return "";
        }

        const type = targetListView && targetListView.datasource.type;
        if (type && type !== "database" && type !== "xpath") {
            return `${widgetName}, widget is only compatible with list view data source type 'Database' and 'XPath'`;
        }
        if (!(targetListView && targetListView._datasource && targetListView._entity && targetListView.update)) {
            return `${widgetName}: this Mendix version is incompatible`;
        }
        if (targetListView._entity && props.listviewEntity !== targetListView._entity) {
            return `${widgetName}: supplied entity "${props.listviewEntity}" does not belong to list view data source`;
        }

        return "";
    }

    static findTargetNode(filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;
            if (targetNode || filterNode.isEqualNode(document) || filterNode.classList.contains("mx-incubator")
            || filterNode.classList.contains("mx-offscreen")) {
                    break;
                }
            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetNode;
    }

    static itContains(array: string[] | string, element: string) {
        return array.indexOf(element) > -1;
    }
}
