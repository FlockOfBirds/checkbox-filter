import "./ui/DataSourceHelper.scss";

interface ConstraintStore {
    [widgetId: string]: string | HybridConstraint;
}

interface Version {
    major: number; minor: number; path: number;
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
        _pageObjs: mendix.lib.MxObject[];
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
}

export class DataSourceHelper {
    static VERSION: Version = { major: 1, minor: 0, path: 0 };
    version: Version;
    private delay = 100; // TODO check optimal timing.
    private timeoutHandle?: number;
    private store: ConstraintStore;
    private widget: ListView;

    constructor(widget: ListView) {
        this.widget = widget;

        this.compatibilityCheck();

        this.store = {};
        this.version = DataSourceHelper.VERSION;
    }

    setConstraint(widgetId: string, constraint: string | HybridConstraint) {
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
        if (!(this.widget._datasource && this.widget._datasource._constraints !== undefined && this.widget._entity && this.widget.update)) {
            throw new Error("Mendix version is incompatible");
        }
    }

    private applyConstraint() {
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
        this.widget.update(null, () => this.hideLoader());
    }

    private showLoader() {
        this.widget.domNode.classList.add("widget-data-source-helper-loading");
    }

    private hideLoader() {
        this.widget.domNode.classList.remove("widget-data-source-helper-loading");
    }
}
