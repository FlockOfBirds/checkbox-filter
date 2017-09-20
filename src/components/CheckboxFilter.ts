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

        // Should have state because select is a controlled component
        this.state = {
            isChecked : this.props.isChecked
        };
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
        // initial state has selectedValue as defaultFilter's index
        // const selectedValue = this.props.defaultFilterIndex < 0 ? "0" : `${this.props.defaultFilterIndex}`;
        // const selectedFilter = this.filters.find(filter => filter.selectedValue === selectedValue);
        this.props.handleChange(this.props.isChecked);
    }

    componentDidUpdate(_prevProps: CheckboxFilterProps, _prevState: CheckboxFilterState) {
        // no need to compare states because the container's state changes impact this component's functionality
        this.props.handleChange(this.state.isChecked);
    }

    private handleOnChange(_event: ChangeEvent<HTMLElement>) {
        this.setState({ isChecked: !this.state.isChecked });
        console.log(this.state.isChecked); // tslint:disable-line
        this.props.handleChange(!this.state.isChecked);
    }
}
