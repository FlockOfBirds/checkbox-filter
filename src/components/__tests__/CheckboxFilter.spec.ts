// import { ReactElement, createElement } from "react";
// import { shallow } from "enzyme";

// import { DropdownFilter, DropdownFilterProps, DropdownType } from "../DropdownFilter";

// describe("DropdownFilter", () => {
//     const renderDropdownFilter = (props: DropdownFilterProps) => shallow(createElement(DropdownFilter, props));
//     const dropdownFilterProps: DropdownFilterProps = {
//         defaultFilterIndex: 1,
//         enableEmptyFilter: true,
//         filters: [ {
//             attribute: "Code",
//             attributeValue: "256",
//             caption: "Country",
//             constraint: "",
//             filterBy: "attribute",
//             isDefault: false
//         } ],
//         handleChange: jasmine.any(Function) as any,
//         placeholder: "Select..."
//     };
//     const optionAttributes: DropdownType = {
//         disabled: true,
//         key: "1",
//         label: "Select...",
//         value: "0"
//     };
//     const options: ReactElement<{}>[] = [
//         createElement("option", optionAttributes),
//         createElement("option", optionAttributes),
//         createElement("option", optionAttributes)
//      ];

//     it("renders the structure correctly", () => {
//         const dropdownFilter = renderDropdownFilter(dropdownFilterProps);

//         expect(dropdownFilter).toBeElement(
//             createElement("select", {
//                 className: "form-control",
//                 onChange: jasmine.any(Function) as any,
//                 value: "1"
//             }, options)
//             );
//     });

//     describe("select", () => {
//         it("changes value", (done) => {
//             const props: DropdownFilterProps = {
//                 defaultFilterIndex: 1,
//                 enableEmptyFilter: true,
//                 filters: [ {
//                     attribute: "Code",
//                     attributeValue: "256",
//                     caption: "Country",
//                     constraint: "",
//                     filterBy: "attribute",
//                     isDefault: false
//                 } ],
//                 handleChange: value => value,
//                 placeholder: "Select..."
//             };
//             spyOn(props, "handleChange").and.callThrough();
//             const wrapper = renderDropdownFilter(props);
//             const select: any = wrapper.find("select");

//             select.simulate("change", {
//                 currentTarget: {
//                     selectedOptions: [
//                         { getAttribute: (_attribute: string) => "Code" }
//                     ],
//                     value: "256"
//                 }
//             });

//             setTimeout(() => {
//                 expect(props.handleChange).toHaveBeenCalledWith(undefined);
//                 done();
//             }, 1000);
//         });

//         it("updates when the select option changes", (done) => {
//             const newValue = "Uganda";
//             const props: DropdownFilterProps = {
//                 defaultFilterIndex: 1,
//                 enableEmptyFilter: true,
//                 filters: [ {
//                     attribute: "Code",
//                     attributeValue: "256",
//                     caption: "Country",
//                     constraint: "",
//                     filterBy: "attribute",
//                     isDefault: false
//                 } ],
//                 handleChange: value => value,
//                 placeholder: "Select..."
//             };
//             spyOn(props, "handleChange").and.callThrough();
//             const wrapper = renderDropdownFilter(props);
//             const select: any = wrapper.find("select");

//             select.simulate("change", {
//                 currentTarget: {
//                     selectedOptions: [
//                         { getAttribute: (_attribute: string) => "Code" }
//                     ],
//                     value: "256"
//                 }
//             });

//             setTimeout(() => {
//                 expect(props.handleChange).toHaveBeenCalledWith(undefined);

//                 select.simulate("change", {
//                     currentTarget: {
//                         selectedOptions: [
//                             { getAttribute: (_attribute: string) => "Name" }
//                         ],
//                         value: newValue
//                     }
//                 });

//                 setTimeout(() => {
//                     expect(props.handleChange).toHaveBeenCalledWith(undefined);
//                     done();
//                 }, 1000);
//             }, 1000);
//         });
//     });
// });
