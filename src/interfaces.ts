// ================================= interfaces ================================

/**
 * Component props represent props that are passed down to the wrapped
 * component. Wrapped components can include: input, select, button, etc.
 *
 * The props are used by the component to interact with the form.
 */
export interface ComponentProps {
  stateKey: string; // unique component identifier - provided by implementor
  initialStateKey: string; // unique id to pull data off of initial state

  // set state and meta data for the wrapped component
  setFormState: (state: ComponentState, meta: ComponentMeta) => void;
  // remove state/meta data for the wrapped component
  removeFormState: () => void;
  // set an error object for the wrapped component
  setFormError: (error: ComponentError) => void;
  // remove an error object for the wrapped component
  removeFormError: () => void;
  // represents the state created by the wrapped component
  componentState: ComponentState;
  // represents meta data created by the wrapped component
  componentMeta: ComponentMeta;
  // represents an error object created by the wrapped component
  componentError: ComponentError;
  // callback used to get the entire form state
  getFormState: () => DisplayState;
  // callback used to get the entire form meta data
  getFormMeta: () => FormMeta;
  // callback used to get all errors for the form
  getFormErrors: () => FormErrors;
  // callback called by button components
  onButtonClick: OnButtonClick;
  // true if any form component, the form or parent is loading
  formLoading: boolean;
  // true if the form is still mounting
  formMounting: boolean;
  // true if the wrapped component is loading
  isLoading: boolean;
  // inform the form the wrapped component is loading
  enableLoading: () => void;
  // disable the wrapped component loading state
  disableLoading: () => void;
  // provide handlers object used to handle logic which identifies if the
  // component is required to be filled out and missing
  setRequired: (required: RequiredHandler) => void;
  // true if the wrapped component has missing data
  isMissing: boolean;
  // message to display for the component if missing
  requiredMessage: RequiredHandler;
  // callback used to inform if there are any missing components
  anyMissing: () => boolean;
  // callback used to return all registered required components
  getFormRequired: () => RequiredElementMessages;
}

/**
 * ShouldUpdate can be provided to the form wrapper. It should return true if
 * the component should re-render (has new data).
 */
export interface ShouldUpdate {
  (oldProps: ComponentProps, newProps: ComponentProps): boolean;
}

/**
 * Handler for button click events. Triggered by nested form buttons and handled
 * by the root onButtonClick callback.
 */
export interface OnButtonClick {
  (buttonID: ButtonID, buttonData: ButtonData): void;
}

/**
 * Handlers for registering a component as being required.
 */
export interface RequiredHandler {
  // what to display if the element is required and not filled out
  displayMessage: string;
  // return true if the component is still required
  isRequired: (state: ComponentState, error: ComponentError) => boolean;
}

/**
 * SetInitialState contains logic used to set the initial state for the wrapped
 * component. It is provided the state key and the initial state object passed
 * to the form and should return the identifying initial state and initial meta
 * data for the component.
 *
 * It contains the logic for pulling data off of initial state and returning it.
 */
export interface SetInitialState {
  (stateKey: StateKey, initialState: InitialState): {
    initialState: ComponentState;
    initialMeta: ComponentMeta;
  };
}

/**
 * Callback triggered by the form used to set initial state.
 *
 * It is used to ensure that the SetInitialState function is called only once
 * for each wrapped component.
 */
export interface SetInitialStateCallback {
  (
    cb: (
      stateKey: StateKey,
      initialState: InitialState | undefined,
      initialMeta: InitialMeta | undefined
    ) => void
  ): any;
}

/**
 * FormProps outlines the props to be passed to the root Form object.
 */
export interface FormProps {
  // components to render
  children: React.ReactNode;
  // initial state used for edit mode (optional). Defaults to {}
  initialState?: InitialState;
  // handler for handling form submit events
  onButtonClick?: (event: FormEvent) => void;
  // pass true if the form should display a loading state. Default false
  loading?: boolean;
}

/**
 * Callback function used to return state for the component
 */
export interface GetComponentState {
  (stateKey: StateKey): ComponentState;
}

/**
 * Callback used to return error values for the component
 */
export interface GetComponentError {
  (stateKey: StateKey): ComponentError;
}

// =================================== types ===================================
/**
 * Alias type for each components stateKey. The stateKey uniquely identifies
 * each component in the form state tree. It is used for storing component
 * state, meta data, errors, required handlers, etc.
 *
 * StateKey *must* be unique among components in the same form.
 */
export type StateKey = string;

/**
 * Alias for each components initialStateKey. The initialStateKey is used to
 * identify the data for the wrapped component in the initial state object.
 */
export type InitialStateKey = string;

/**
 * InitialMeta represents the initial meta data passed to the form. Initial data
 * is passed when a form mounts which typically occurs in edit mode.
 *
 * InitialMeta is passed to the form via it's props and then mounted on the
 * display state for each form component.
 */
export type InitialMeta = { [initialStateKey: string]: ComponentMeta };

/**
 * DisplayMeta is used to track the meta data for the display of the component.
 *
 * In create mode the DisplayMeta and FormMeta will be mirrors of each other. In
 * edit mode, the DisplayMeta will contain all meta data pulled off of the
 * initial state but the FormMeta will only contain any meta data for edited
 * (changed) components. For example, if editing a form with an *input* the
 * DisplayMeta will contain the input value pulled off of the initial state.
 * Whereas FormMeta will contain the meta data only if the input is changed.
 */
export type DisplayMeta = { [stateKey: string]: ComponentMeta };

export type InitialState = { [initialStateKey: string]: ComponentState };

/**
 * DisplayState is used to track the state data for the display of the
 * component.
 *
 * In create mode the DisplayState and FormState will be mirrors of each other.
 * In edit mode, the DisplayState will contain all state data pulled off of the
 * initial state but the FormState will only contain any state data for edited
 * (changed) components. For example, if editing a form with an *input* the
 * DisplayState will contain the input value pulled off of the initial state.
 * Whereas FormState will contain the state data only if the input is changed.
 */
export type DisplayState = { [stateKey: string]: ComponentState };

/**
 * FormMeta is used to track the meta data for all the components in the form.
 * It only contains changed data and nothing off of initial state.
 *
 * In create mode the DisplayMeta and FormMeta will be mirrors of each other. In
 * edit mode, the DisplayMeta will contain all meta data pulled off of the
 * initial state but the FormMeta will only contain any meta data for edited
 * (changed) components. For example, if editing a form with an *input* the
 * DisplayMeta will contain the input value pulled off of the initial state.
 * Whereas FormMeta will contain the meta data only if the input is changed.
 */
export type FormMeta = { [stateKey: string]: ComponentMeta };

/**
 * FormState is used to track the state of the forms components. It only
 * contains the changed data and nothing off of the initial state.
 *
 * In create mode the DisplayState and FormState will be mirrors of each other.
 * In edit mode, the DisplayState will contain all state data pulled off of the
 * initial state but the FormState will only contain any state data for edited
 * (changed) components. For example, if editing a form with an *input* the
 * DisplayState will contain the input value pulled off of the initial state.
 * Whereas FormState will contain the state data only if the input is changed.
 */
export type FormState = {
  formState: { [stateKey: string]: ComponentState };
  displayState: DisplayState;
  formMeta: FormMeta;
  displayMeta: DisplayMeta;
  stateChanged: boolean;
};

/**
 * FormErrors represents error object for each form component.
 */
export type FormErrors = { [stateKey: string]: ComponentError };
/**
 * ComponentError is an acceptable type for each components error object.
 */
export type ComponentError = { [key: string]: any };

/**
 * FormLoading contains all the objects currently in loading state.
 *
 * It is a map whose key is the SetStateKey and a boolean of whether the
 * component is loading or not.
 */
export type FormLoading = { [stateKey: string]: boolean };

/**
 * ComponentState defines the type of state that the wrapped component can
 * handle.
 * Wrapped components include: input, button, select and other form components
 */
export type ComponentState = any;

/**
 * ComponentMeta defines the type of meta that the wrapped component can handle.
 * Wrapped components include: input, button, select and other form components
 */
export type ComponentMeta = any;

/**
 * Object which tracks all registered required elements
 */
export type RequiredHandlers = {
  [stateKey: string /* StateKey */]: RequiredHandler;
};

/**
 * Used to quickly identify if the component is still missing data without
 * having the receiver call each isRequired callback.
 */
export type RequiredElementMessage = {
  displayMessage: string;
  isMissing: boolean;
};

/**
 * Object whose keys are each components StateKey and values are a
 * RequiredElementMessage. The RequiredElementMessage contains the display
 * message and evaluated isRequired callback
 */
export type RequiredElementMessages = {
  [stateKey: string]: RequiredElementMessage;
};

/**
 * ButtonID is a unique identifier for the button. The ButtonID is passed to the
 * onClick handler which can be used to identify which button is pressed. The
 * default ButtonID is 'submit'
 */
export type ButtonID = string;

/**
 * ButtonData is optional data that can be passed from a form components button
 * to the button handler. This can include additional identifiable info used by
 * the handler to determine which actions should be taken.
 */
export type ButtonData = {};

/**
 * FormEventType represents the type of form action. Currently it can be one of:
 *  - 'buttonClick' - fired when a form button is clicked
 */
export type FormEventType = 'buttonClick';

/**
 * FormEvent represents a form action that is passed down to a handler.
 */
export type FormEvent = {
  id: ButtonID;
  type: FormEventType;

  // form state data
  state: {
    displayMeta: DisplayMeta;
    formMeta: FormMeta;
    displayState: DisplayState;
    formLoading: boolean;
    formMounting: boolean;
    formState: { [stateKey: string]: ComponentState };
    initialState: InitialState;
    stateChanged: boolean;
  };

  // form errors
  errors: {
    formErrors: FormErrors;
  };

  // custom clicked button data
  buttonData: ButtonData;

  // form required info
  formRequired: {
    required: RequiredElementMessages;
    anyMissing: boolean;
  };
};
