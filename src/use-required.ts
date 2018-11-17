import { useReducer, useEffect, ComponentState } from 'react';
import {
  StateKey,
  GetComponentState,
  GetComponentError,
  RequiredElementMessages,
  RequiredHandler,
  RequiredElementMessage,
  RequiredHandlers,
} from './interfaces';

type ReducerAction = {
  type: string;
  stateKey: StateKey;
  required: RequiredHandler;
};

// ================================== reducer ==================================

const reducer = (state: RequiredHandlers, action: ReducerAction) => {
  switch (action.type) {
    case actions.ADD:
      return {
        ...state,
        [action.stateKey]: {
          isRequired: (state: ComponentState) => !state,
          displayMessage: `${action.stateKey} Missing and Required`,
          ...action.required,
        },
      };
    default:
      return state;
  }
};
const actions = { ADD: 'FORM_REQUIRED.ADD' };

// =================================== effect ==================================

/**
 * useFormRequired tracks all required components and their required status.
 *
 * Each required form component provides a displayMessage to be used to display
 * if the component has missing data. It also provides an isRequired callback
 * which returns true if the current component is required still. Each
 * registered component stays registered
 *
 * @param getComponentState - callback which returns state for a specific
 * component as identified by the stateKey
 * @param getComponentError - callback which returns an error object for a
 * specific component as identified by the stateKey
 */
const useFormRequired = (
  getComponentState: GetComponentState,
  getComponentError: GetComponentError
) => {
  const initialState: RequiredHandlers = {};
  const [requiredComponents, dispatch] = useReducer(reducer, initialState);

  /*
    required to include:
    {
      isRequired: function,
      displayError: string
    }
   */
  const setRequired = (stateKey: StateKey, required: RequiredHandler) =>
    useEffect(() => dispatch({ type: actions.ADD, stateKey, required }), [
      stateKey,
    ]);

  const getFormRequired = () => {
    const result: RequiredElementMessages = {};

    Object.keys(requiredComponents).forEach((key: StateKey) => {
      const required = requiredComponents[key];
      result[key] = {
        displayMessage: required.displayMessage,
        isMissing: required.isRequired(
          getComponentState(key),
          getComponentError(key)
        ),
      };
    });
    return result;
  };

  return {
    setRequired,
    getComponentRequired: (stateKey: StateKey) => requiredComponents[stateKey],
    /**
     * Returns an object who's fields are the stateKey values of all registered
     * required components. Their respective values contain the required data
     * and identify if the component is missing
     */
    getFormRequired,
    /**
     * Returns true if there are any missing components
     */
    anyMissing: () => {
      let missing = false;

      Object.values(getFormRequired()).forEach(
        (required: RequiredElementMessage) => {
          if (required.isMissing) {
            missing = true;
          }
        }
      );
      return missing;
    },
    isMissing: (stateKey: StateKey) => {
      if (!!requiredComponents[stateKey]) {
        return requiredComponents[stateKey].isRequired(
          getComponentState(stateKey),
          getComponentError(stateKey)
        );
      }
      return false;
    },
  };
};

export default useFormRequired;
