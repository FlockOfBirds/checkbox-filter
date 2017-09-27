import { ChangeEvent, Component, createElement } from "react";

export interface CheckboxFilterProps {
    isChecked: boolean;
    handleChange: (value: boolean) => void;
}

interface CheckboxFilterState {
    isChecked: boolean;
}

export class CheckboxFilter extends Component<CheckboxFilterProps, CheckboxFilterState> {
    constructor(props: CheckboxFilterProps) {
        super(props);

        this.state = { isChecked : this.props.isChecked };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("input", {
            checked: this.state.isChecked,
            defaultChecked: this.state.isChecked,
            onChange: this.handleOnChange,
            type: "checkbox"
        });
    }

    componentDidMount() {
            this.props.handleChange(this.props.isChecked);
        }

    componentWillReceiveProps(newProps: CheckboxFilterProps) {
        if (this.props.isChecked !== newProps.isChecked) {
            this.setState({ isChecked : newProps.isChecked });
        }
    }

    componentDidUpdate(_prevProps: CheckboxFilterProps, _prevState: CheckboxFilterState) {
        this.props.handleChange(this.state.isChecked);
    }

    private handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({ isChecked: event.target.checked });
    }
}
