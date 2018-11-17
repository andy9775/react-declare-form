import { useReducer } from 'react';
import { StateKey, FormErrors, ComponentError } from './interfaces';

type ReducerAction = {
  type: string;
  stateKey: StateKey;
  error?: any;
};

// ================================== reducer ==================================

const reducer = (state: FormErrors, action: ReducerAction) => {
  switch (action.type) {
    case actions.ADD:
      return {
        ...state,
        [action.stateKey!]: {
          displayError: `${action.stateKey} Error`,
          ...action.error,
        },
      };
    case actions.REMOVE:
      if (!!state[action.stateKey!]) {
        const newState = { ...state };
        delete newState[action.stateKey!];
        return newState;
      }
      return state;
    default:
      return state;
  }
};

const actions = {
  ADD: 'FORM_ERRORS.ADD',
  REMOVE: 'FORM_ERRORS.REMOVE',
};

// =================================== effect ==================================

/**
 * Handles form wide errors used to inform the form and child components if
 * errors exist.
 */
const useFormError = () => {
  const initialState: FormErrors = {};
  const [formErrors, dispatch] = useReducer(reducer, initialState);

  const getComponentError = (stateKey: StateKey): ComponentError => {
    return formErrors[stateKey];
  };
  const getFormErrors = () => {
    return formErrors;
  };

  return {
    formErrors,
    getComponentError,
    getFormErrors,
    /**
     * Error is an object and includes
     *  displayError: string // what error message to display
     */
    setFormError: (stateKey: StateKey, error: ComponentError) => {
      dispatch({ type: actions.ADD, error, stateKey });
    },
    removeFormError: (stateKey: StateKey) => {
      dispatch({ type: actions.REMOVE, stateKey });
    },
  };
};

export default useFormError;
