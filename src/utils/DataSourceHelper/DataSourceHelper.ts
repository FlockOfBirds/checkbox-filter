import "./DataSourceHelper.scss";

interface ConstraintStore {
    [widgetId: string]: string | HybridConstraint;
}

interface Version {
    major: number;
    minor: number;
    patch: number;
}

interface HybridConstraint {
    attribute: string;
    operator: string;
    value: string;
    path?: string;
}

interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint[] | string;
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
}

export class DataSourceHelper {
    // The version of a Datasource is static, it never changes.
    static VERSION: Version = { major: 1, minor: 0, patch: 0 };
    // The static data source version is made publicly accessible through this variable on dataSourceHelper instances.
    public version: Version = DataSourceHelper.VERSION;
    private delay = 50;
    private timeoutHandle?: number;
    private store: ConstraintStore = {};
    private widget: ListView;
    private running = false;
    private isConstraintChanged = false;

    constructor(widget: ListView) {
        this.widget = widget;
        this.compatibilityCheck();
    }

    setConstraint(widgetId: string, constraint: string | HybridConstraint) {
        this.store[widgetId] = constraint;

        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }
        if (!this.running) {
            this.timeoutHandle = window.setTimeout(() => {
                this.running = true;
                // TODO Check if there's currently no update happening on the listView.
                // If there's an update running set a timeout and try it out later.
                this.iterativeApplyConstraint();
          }, this.delay);
        } else {
            this.isConstraintChanged = true;
        }
    }

    private iterativeApplyConstraint() {
        this.applyConstraint(() => {
            if (this.isConstraintChanged) {
                this.isConstraintChanged = false;
                this.iterativeApplyConstraint();
            } else {
                this.running = false;
            }
        });
    }

    public static checkVersionCompatible(version: Version): boolean {
        return this.VERSION.major === version.major;
    }

    private compatibilityCheck() {
        if (!(this.widget._datasource && this.widget._datasource._constraints !== undefined && this.widget._entity
                && this.widget.update && this.widget.datasource.type)) {
            throw new Error("Mendix version is incompatible");
        }
    }

    private applyConstraint(callback: () => void) {
        let constraints: HybridConstraint[] | string;

        if (window.device) {
            constraints = Object.keys(this.store)
                .map(key => this.store[key] as HybridConstraint)
                .filter(mobileConstraint => mobileConstraint.value);
        } else {
            constraints = Object.keys(this.store)
                .map(key => this.store[key]).join("");
        }

        this.widget._datasource._constraints = constraints;
        this.showLoader();
        this.widget.update(null, () => {
           this.hideLoader();
           callback();
        });
    }

    private showLoader() {
        this.widget.domNode.classList.add("widget-data-source-helper-loading");
    }

    private hideLoader() {
        this.widget.domNode.classList.remove("widget-data-source-helper-loading");
    }
}
