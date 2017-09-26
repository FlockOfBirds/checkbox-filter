import { ChangeEvent, Component, createElement } from "react";

export interface CheckboxFilterProps {
    caption?: string;
    isChecked: boolean;
    handleChange: (value: boolean) => void;
}

interface CheckboxFilterState {
    isChecked: boolean;
}

export class CheckboxFilter extends Component<CheckboxFilterProps, CheckboxFilterState> {

    constructor(props: CheckboxFilterProps) {
        super(props);

        // Should have state because select is a controlled component
        this.state = { isChecked : this.props.isChecked };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("div", {},
            createElement("input", {
                checked: this.state.isChecked,
                defaultChecked: this.state.isChecked,
                onChange: this.handleOnChange,
                type: "checkbox"
            }),
            createElement("span", {}, ` ${this.props.caption}`)
        );
    }

    componentDidMount() {
        this.props.handleChange(this.props.isChecked);
    }

    componentDidUpdate(_prevProps: CheckboxFilterProps, _prevState: CheckboxFilterState) {
        // no need to compare states because the container's state changes impact this component's functionality
        this.props.handleChange(this.state.isChecked);
    }

    private handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({ isChecked: event.target.checked });
    }
}
