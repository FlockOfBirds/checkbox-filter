// USAGE
// private connectToListView() {
//     const filterNode = findDOMNode(this).parentNode as HTMLElement;
//     const targetNode = Utils.findTargetNode(filterNode);
//     let targetListView: ListView | null = null;

//     if (targetNode) {
//         this.setState({ targetNode });
//         targetListView = dijitRegistry.byNode(targetNode);
//         if (targetListView) {
//             if (targetListView.__customWidgetDataSourceHelper) {
//                 try {
//                 targetListView.__customWidgetDataSourceHelper = new DataSourceHelper(targetListView);
//                 } catch (error) {
//                     // TODO show nice message message
//                 }
//             } else if (!DataSourceHelper.checkVersionCompatible(targetListView.__customWidgetDataSourceHelper.VERSION)) {
//                   // TODO show nice message message
//             }
//             this.dataSourceHelper = targetListView.__customWidgetDataSourceHelper;
//         }
//     }
// }
//
// private applyFilter(isChecked: boolean) {
//    // construct constraint based on checked
//    const constraint = isChecked ? [contains("attribute", "value")]` : "";
//    this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
// }

interface ConstraintStore {
    [widgetId: string]: string;
}

interface Version {
    major: number; minor: number; path: number;
}

type filterOptions = "attribute" | "XPath" | "None";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _pageObjs: mendix.lib.MxObject[];
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
}

class DataSourceHelper {
    static VERSION: Version = { major: 1, minor: 0, path: 0 };
    private delay = 100; // TODO check optimal timing.
    private timeoutHandle?: number;
    private originalConstraint: string;
    private store: ConstraintStore;
    private widget: ListView;

    constructor(widget: ListView) {
        this.widget = widget;

        this.compatibilityCheck();

        this.store = {};
        // TODO make constraints compatible with hybrid.
        this.originalConstraint = this.widget._datasource._constraints as string;

        // TODO connect on loading status of widget
    }

    setConstraint(widgetId: string, constraint: string) {
        this.store[widgetId] = constraint;
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }
        this.timeoutHandle = window.setTimeout(() => {
            this.applyConstraint();
        }, this.delay);
    }

    public static checkVersionCompatible(version: Version): boolean {
        return DataSourceHelper.VERSION.major === version.major;
    }

    private compatibilityCheck() {
        // TODO check all api parts are checked.
        if (!(this.widget._datasource && this.widget._datasource._constraints && this.widget._entity && this.widget.update)) {
            throw new Error("Mendix version is incompatible");
        }
    }

    private applyConstraint() {
        // TODO check is listview is not destroyed or is still loading.
        const customConstraint = Object.keys(this.store)
            .map(key => this.store[key])
            .join("");
        this.widget._datasource._constraints = this.originalConstraint + customConstraint;
        this.showLoader();
        this.widget.update(null, () => this.hideLoader());
    }

    private showLoader() {
        this.widget.domNode.classList.add("widget-data-source-helper-loading");
    }

    private hideLoader() {
        this.widget.domNode.classList.remove("widget-data-source-helper-loading");
    }
}
