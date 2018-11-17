import { useEffect, useReducer } from 'react';
import {
  StateKey,
  FormState,
  ComponentState,
  ComponentMeta,
  SetInitialStateCallback,
} from './interfaces';

type ReducerAction = {
  type: string;
  stateKey: StateKey;
  state?: ComponentState;
  meta?: ComponentMeta;
};

// ================================== reducer ==================================

const reducer = (state: FormState, action: ReducerAction) => {
  const fs: { [stateKey: string]: ComponentState } = {};
  const fm: { [stateKey: string]: ComponentMeta } = {};

  switch (action.type) {
    case actions.SET_INITIAL_STATE:
      return {
        ...state,
        displayState: {
          ...state.displayState,
          [action.stateKey]: action.state,
        },
        stateChanged: false,
      };
    case actions.SET_INITIAL_META:
      return {
        ...state,
        displayMeta: {
          ...state.displayMeta,
          [action.stateKey]: action.meta,
        },
        stateChanged: false,
      };
    case actions.SET_FORM_STATE:
      return {
        ...state,
        formState: {
          ...state.formState,
          [action.stateKey]: action.state,
        },
        displayState: {
          ...state.displayState,
          [action.stateKey]: action.state,
        },
        stateChanged: true,
      };
    case actions.SET_FORM_META:
      return {
        ...state,
        formMeta: {
          ...state.formMeta,
          [action.stateKey]: action.meta,
        },
        displayMeta: {
          ...state.displayMeta,
          [action.stateKey]: action.meta,
        },
        stateChanged: true,
      };
    case actions.REMOVE_FORM_STATE:
      return {
        ...state,
        /*
          display state contains the actual view of the current form. If an 
          element is removed from form state, the new form state will contain 
          the new form state - not just the changed elements.
         */
        formState: Object.keys(state.displayState).reduce((object, key) => {
          if (key !== action.stateKey) {
            object[key] = state.displayState[key];
          }
          return object;
        }, fs),
        displayState: Object.keys(state.displayState).reduce((object, key) => {
          if (key !== action.stateKey) {
            object[key] = state.displayState[key];
          }
          return object;
        }, fs),
        stateChanged: true,
      };
    case actions.REMOVE_FORM_META:
      return {
        ...state,
        /*
          display meta contains the actual vew of the current form. If an
          element is removed from the form, the new form meta will contain the
          entire new form meta object - not just the changed elements.f
         */
        formMeta: Object.keys(state.displayMeta).reduce((object, key) => {
          if (key !== action.stateKey) {
            object[key] = state.displayMeta[key];
          }
          return object;
        }, fm),
        displayMeta: Object.keys(state.displayMeta).reduce((object, key) => {
          if (key !== action.stateKey) {
            object[key] = state.displayMeta[key];
          }
          return object;
        }, fm),
        stateChanged: true,
      };
    default:
      return state;
  }
};

const actions = {
  SET_INITIAL_STATE: 'FORM_STATE.INITIAL_STATE.SET',
  SET_INITIAL_META: 'FORM_STATE.INITIAL_META.SET',

  SET_FORM_STATE: 'FORM_STATE.STATE.SET',
  SET_FORM_META: 'FORM_STATE.META.SET',

  REMOVE_FORM_STATE: 'FORM_STATE.STATE.REMOVE',
  REMOVE_FORM_META: 'FORM_STATE.META.REMOVE',
};

// =================================== effect ==================================

/**
 * Handles form wide state. State includes:
 *
 * state - any user inputted data that is to be submitted with the form. If in
 * edit mode, the state only includes changed fields
 *
 * displayState - represents what is currently displayed in the form. If in edit
 * mode it includes data stripped from initialState as well as any user made
 * changes.
 *
 * meta - any generated meta data after user inputs fields. If in edit mode,
 * meta only includes the changed fields meta data. Not all fields will have
 * associated meta data with them. Meta data can be used for things like
 * dropdown components which use objects to display and manipulate the options
 *
 * displayMeta - like meta data but used to display to the user. If in edit mode
 * it will include meta data fetched based on the initial state or any changes.
 * Like state and displayState, it displays data derived from initial state but
 * anything in meta overrides
 *
 * changed - boolean representing if the form has changed or not. This is a
 * shallow comparison and it's value is toggled to true when user inputs any
 * info. It is most useful when in edit mode and trying to determine if the form
 * should be submitted.
 */
const useFormState = () => {
  const initialState: FormState = {
    formState: {}, // tracks all form state that has changed via user input
    displayState: {}, // tracks state that is to be displayed on the form
    formMeta: {}, // tracks metadata used by the form
    displayMeta: {}, // tracks metadata displayed by the form
    stateChanged: false,
  };

  const [formState, dispatch] = useReducer(reducer, initialState);

  const getComponentState = (stateKey: StateKey) => {
    return formState.displayState[stateKey];
  };
  const getFormState = () => {
    return formState.displayState;
  };

  const getComponentMeta = (stateKey: StateKey) => {
    return formState.displayMeta[stateKey];
  };
  const getFormMeta = () => {
    return formState.displayMeta;
  };

  return {
    formState,
    getComponentState,
    getFormState,
    getComponentMeta,
    getFormMeta,
    setFormState: (
      stateKey: StateKey,
      state: ComponentState,
      meta: ComponentMeta
    ) => {
      if (!!state) {
        dispatch({
          type: actions.SET_FORM_STATE,
          stateKey,
          state,
        });
      }
      if (!!meta) {
        dispatch({
          type: actions.SET_FORM_META,
          stateKey,
          meta,
        });
      }
    },
    removeFormState: (stateKey: StateKey) => {
      dispatch({
        type: actions.REMOVE_FORM_STATE,
        stateKey,
      });
      dispatch({
        type: actions.REMOVE_FORM_META,
        stateKey,
      });
    },
    /**
     * used to set the initial form state - typically when in edit mode
     */
    setInitialState: (stateKey: StateKey, cb: SetInitialStateCallback) => {
      useEffect(
        () => {
          /*
            Use the provided setter callback to ensure `stateChanged` status
            does not change when setting the first state.
           */
          cb(
            (
              stateKey: StateKey,
              state: ComponentState,
              meta: ComponentMeta
            ) => {
              if (!!state) {
                dispatch({
                  type: actions.SET_INITIAL_STATE,
                  stateKey,
                  state,
                });
              }
              if (!!meta) {
                dispatch({
                  type: actions.SET_INITIAL_META,
                  stateKey,
                  meta,
                });
              }
            }
          );
        },
        [formState.formState[stateKey]]
      );
    },
  };
};

export default useFormState;
