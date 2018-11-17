import React, { createContext, useContext } from 'react';
import {
  StateKey,
  SetInitialStateCallback,
  ComponentState,
  ComponentMeta,
  ComponentError,
  ComponentProps,
  DisplayState,
  FormErrors,
  FormMeta,
  RequiredHandler,
  ButtonData,
  ButtonID,
  ShouldUpdate,
  InitialState,
  SetInitialState,
  InitialStateKey,
  RequiredElementMessages,
} from './interfaces';

// ================================== context ==================================

const FormContext = createContext({
  setInitialState: (_: StateKey, __: SetInitialStateCallback) => {},
  initialState: {},
  setFormState: (
    _: StateKey,
    __: ComponentState,
    ___: ComponentMeta
  ): void => {},
  removeFormState: (_: StateKey): void => {},
  setFormError: (_: StateKey, __: ComponentError): void => {},
  removeFormError: (_: StateKey): void => {},
  getComponentState: (_: StateKey): ComponentState => ({}),
  getComponentMeta: (_: StateKey): ComponentMeta => ({}),
  getComponentError: (_: StateKey): ComponentError => ({}),
  getFormState: (): DisplayState => ({}),
  getFormMeta: (): FormMeta => ({}),
  getFormErrors: (): FormErrors => ({}),
  formLoading: false,
  formMounting: false,
  isLoading: (_: StateKey): boolean => false,
  enableLoading: (_: StateKey): void => {},
  disableLoading: (_: StateKey): void => {},
  setRequired: (_: StateKey, __: RequiredHandler): void => {},
  isMissing: (_: StateKey): boolean => false,
  getComponentRequired: (stateKey: StateKey): RequiredHandler => ({
    isRequired: () => false,
    displayMessage: `${stateKey} Missing and Required`,
  }),
  anyMissing: (): boolean => false,
  getFormRequired: (): RequiredElementMessages => ({}),
  onButtonClick: (_: ButtonID, __: ButtonData): void => {},
});

// ============================= wrapper functions =============================

/**
 * Wraps the provided Component with React Memoize functionality.
 *
 * This allows functional components to implement shouldComponentUpdate which
 * prevents unnecessary renders.
 *
 * @param Component - the component to memoize
 * @param shouldUpdate - an updater function
 */
const memoize = (
  Component: React.StatelessComponent<ComponentProps>,
  shouldUpdate: ShouldUpdate
) => {
  return React.memo(
    Component,
    (oldProps: ComponentProps, newProps: ComponentProps) => {
      if (!!shouldUpdate && typeof shouldUpdate === 'function') {
        return shouldUpdate(oldProps, newProps);
      }
      return true;
    }
  );
};

/**
 * Fetch initial state from the root form and add it to the wrapped component.
 * By default this uses the `initialStateKey` prop to fetch state off of the
 * root initial state object.
 *
 * The `setInitialStateCallback` function is called to fetch data off of the
 * initial state object allowing for customization for certain components
 *
 * @param Component - the component to add form initial state to
 * @param setInitialStateCallback - callback function used to fetch
 * initial state off of the form and add it to form state
 */
const wrapComponent = (
  Component: React.StatelessComponent<ComponentProps>,
  setInitialStateCallback: SetInitialState
) => {
  return (props: ComponentProps) => {
    const formContext = useContext(FormContext);
    if (
      !!setInitialStateCallback &&
      typeof setInitialStateCallback === 'function' &&
      props.initialStateKey &&
      props.stateKey
    ) {
      formContext.setInitialState(props.stateKey, setInitialState => {
        const state = setInitialStateCallback(
          props.initialStateKey,
          formContext.initialState
        );
        setInitialState(props.stateKey, state.initialState, state.initialMeta);
      });
    }

    return (
      <Component
        {...props} // component specific props
        setFormState={(state, meta) =>
          formContext.setFormState(props.stateKey, state, meta)
        }
        removeFormState={() => formContext.removeFormState(props.stateKey)}
        setFormError={error => formContext.setFormError(props.stateKey, error)}
        removeFormError={() => formContext.removeFormError(props.stateKey)}
        componentState={formContext.getComponentState(props.stateKey)}
        componentMeta={formContext.getComponentMeta(props.stateKey)}
        componentError={formContext.getComponentError(props.stateKey)}
        getFormState={formContext.getFormState}
        getFormMeta={formContext.getFormMeta}
        getFormErrors={formContext.getFormErrors}
        onButtonClick={formContext.onButtonClick}
        formLoading={formContext.formLoading}
        formMounting={formContext.formMounting}
        isLoading={formContext.isLoading(props.stateKey)}
        enableLoading={() => formContext.enableLoading(props.stateKey)}
        disableLoading={() => formContext.disableLoading(props.stateKey)}
        setRequired={required =>
          formContext.setRequired(props.stateKey, required)
        }
        isMissing={formContext.isMissing(props.stateKey)}
        requiredMessage={formContext.getComponentRequired(props.stateKey)}
        anyMissing={formContext.anyMissing}
        getFormRequired={formContext.getFormRequired}
      />
    );
  };
};

// ============================== default function =============================

/**
 * default handler for setting initial state
 *
 * Internally it pulls off data off of the initial state object using the
 * initial state key
 *
 * @param initialStateKey - identifier used to pull data off of the initial
 * state object for the wrapped component
 * @param initialState - the initial state object
 */
const defaultSetInitialState: SetInitialState = (
  initialStateKey: InitialStateKey,
  initialState: InitialState
) => ({
  initialState: initialState[initialStateKey],
  initialMeta: initialState[initialStateKey],
});

/**
 * default handler to check if component should update
 *
 * @param oldProps - previous component props
 * @param newProps - next component props
 */
const defaultShouldUpdate: ShouldUpdate = (
  oldProps: ComponentProps & {},
  newProps: ComponentProps & {}
) => {
  if (
    newProps.componentState === undefined &&
    oldProps.componentState === undefined
  ) {
    return false;
  }
  // just check state and errors otherwise don't update (re-render)
  return (
    newProps.componentState === oldProps.componentState &&
    newProps.componentError === oldProps.componentError &&
    newProps.isLoading === oldProps.isLoading &&
    newProps.isMissing === oldProps.isMissing
  );
};

// ============================== context provider =============================

/**
 * Adds Form Context to the Component. Form Context includes Form related
 * callbacks used to set and get state and errors.
 *
 * @param Component - The component to add form context to
 * @param setInitialStateCallback  - If true, initial state
 * is pulled for
 * the component and automatically set
 * @param shouldUpdate - Callback function which specifies if the
 * component should update (re-render)
 */
const withFormContext = (
  Component: React.StatelessComponent<ComponentProps>,
  {
    setInitialStateCallback = defaultSetInitialState,
    shouldUpdate = defaultShouldUpdate,
  } = {}
) => {
  return wrapComponent(
    memoize(Component, shouldUpdate),
    setInitialStateCallback
  );
};

export default FormContext;
export { withFormContext };
