import { useReducer } from 'react';
import { StateKey, FormLoading } from './interfaces';

type ReducerAction = {
  stateKey: StateKey;
  type: string;
};

// ================================== reducer ==================================

const reducer = (state: FormLoading, action: ReducerAction) => {
  switch (action.type) {
    case actions.ADD:
      return {
        ...state,
        [action.stateKey]: true,
      };
    case actions.REMOVE:
      if (state[action.stateKey]) {
        const newState = { ...state };
        delete newState[action.stateKey];
        return newState;
      }
      return state;
    default:
      return state;
  }
};

const actions = {
  ADD: 'FORM_LOADING.ADD',
  REMOVE: 'FORM_LOADING.REMOVE',
};

// =================================== effect ==================================

/**
 * Handles toggling custom loading status for the form. It is most useful for
 * form components which use side effects to fetch data.
 *
 * The loading status of a form is derived from the loading status passed in to
 * form props as well as the loading status of child components performing work.
 */
const useFormLoading = () => {
  /*
    Object where the key is the components stateKey property and the value is
    true, otherwise the component is deleted from the object
   */
  const initialState: FormLoading = {};
  const [loadingComponents, dispatch] = useReducer(reducer, initialState);

  const disableLoading = (stateKey: StateKey) =>
    dispatch({ type: actions.REMOVE, stateKey });

  const enableLoading = (stateKey: StateKey) =>
    dispatch({ type: actions.ADD, stateKey });

  const isLoading = (stateKey: StateKey) => !!loadingComponents[stateKey];

  return {
    formLoading: () => Object.keys(loadingComponents).length > 0,
    enableLoading,
    disableLoading,
    isLoading,
    loadingComponents,
  };
};

export default useFormLoading;
