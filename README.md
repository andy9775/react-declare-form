# react-declare-form

A declarative approach towards building forms in react

## NOTE: This project uses react hooks which are available in alpha.

View the RFC [here](https://github.com/reactjs/rfcs/pull/68)

## About

The purpose of **react-declare-form** is encapsulate form state management into a
root component which wraps children (input, button, select) to allow a
declarative way of building up forms.

**react-declare-form** supports handling of required components by defining a
callback function which returns if a form component has been filled out or not.
It also supports passing up errors. Both of these objects are available
throughout all form components which allows error messages to be displayed
around buttons and other form components for example.

**react-declare-form** only exports two elements. A root form component `Form`
which should be provided with wrapped components. Components should be wrapped
using `connectToForm` function which provides props to the form components to
be used in fetching and settings state, errors and required handler logic.
Anyone familiar with the Redux style connect function will be comfortable with
this pattern. This means that buttons, inputs, selects and other form
components need to be wrapped and built and are **not** provided.

## API

### Form Components

NOTE: Each form component should have a `stateKey` and `initialStateKey` prop
provided. Both of these should be unique as they identify that particular
components state throughout the form.

TODO

## Example

```javascript
let Input = props => (
  <input
    value={props.componentState || ''}
    onChange={e => {
      e.preventDefault();
      props.setFormState(
        event.target.value, // state
        event.target.value // meta
      );
    }}
    type="text"
  />
);
Input = connectToForm(Input);

let Button = props => (
  <button onClick={() => props.onButtonClick(props.id)}>
    {this.props.children}
  </button>
);
Button = connectToForm(Button, { setInitialStateCallback: false });

const initialState = { email: 'andy@react.com' };

const myForm = () => (
  <Form
    onButtonClick={formEvent => {
      // Submit form
      api.post(url, formEvent.state.displayState);
    }}
    initialState={initialState}
  >
    <Input stateKey="email" initialStateKey="email" />
    <Button id="submit">Submit</Button>
  </Form>
);
```
