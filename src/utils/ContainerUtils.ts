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
    static validate(props: ContainerProps & { filterNode: HTMLElement; targetListView: ListView; validate: boolean}): string {
        const widgetName = "dropdown-filter";
        // validate filter values if filterby = attribute, then value should not be empty or "" or " ".
        if (!props.filterNode) {
            return `${widgetName}: unable to find a listview with to attach to`;
        }

        if (!(props.targetListView && props.targetListView._datasource)) {
            return `${widgetName}: this Mendix version is incompatible`;
        }

        if (props.entity && !Utils.itContains(props.entity, "/")) {
            if (props.entity !== props.targetListView._entity) {
                return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
            }
        }

        // if (props.filters && !props.filters.length) {
        //     return `${widgetName}: should have atleast one filter`;
        // }

        // if (props.filters) {
        //     const errorMessage: string[] = [];
        //     props.filters.forEach((filter, index) => {
        //         if (filter.filterBy === "XPath" && !filter.constraint) {
        //             errorMessage.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
        //         }
        //         if (filter.filterBy === "attribute" && !filter.attributeValue) {
        //             errorMessage.push(`Filter position: {${index + 1 }} is missing a Value constraint`);
        //         }
        //     });
        //     if (errorMessage.length) {
        //         return `${widgetName} : ${errorMessage.join(", ")}`;
        //     }
        // }
        // if (props.filters.filter(filter => filter.isDefault).length > 1) {
        //     return `${widgetName}: should only have one filter set as default`;
        // }

        return "";
    }

    static isCompatible(targetListView: ListView): boolean {
        return !!(targetListView && targetListView._datasource);
    }

    static findTargetNode(filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;
            if (targetNode || filterNode.classList.contains("mx-incubator")
            || filterNode.classList.contains("mx-offscreen") || filterNode.isEqualNode(document)) {
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
