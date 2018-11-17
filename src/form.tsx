import React from 'react';
import FormContext, { withFormContext } from './context';
import useFormState from './use-state';
import useFormLoading from './use-loading';
import useFormError from './use-error';
import useFormMounting from './use-mounting';
import useRequired from './use-required';
import { FormProps } from './interfaces';

/**
 * Form wraps an html form element and stores data via a context for all the
 * child form elements.
 *
 * Each child component (input, select, etc.) is identified by a unique (passed
 * via props) stateKey. The stateKey is used to store the components state, meta
 * data, errors, required data handlers, etc. in the forms context. Hence the
 * stateKey must be unique amongst each Form's children.
 *
 * The Form works by storing meta data and state. Meta data can be used to
 * display additional values for the child components whereas the state is used
 * to store the actual value to be passed through to the backend. For example,
 * for a dropdown picker component, the meta data can store the object that has
 * currently been picked and selected. This object can contain the selected
 * elements id, name, value, etc. The state object would only contain the id.
 * Then when submitting the Form, the selected objects id is passed to the
 * backend and persisted.
 *
 * The Form also separates display and actual data by using displayState and
 * state, and displayMeta and meta. The display* state represents the data that
 * is shown in the form components. Each child component gets it's state from
 * the display state property. The state/meta objects represent the user
 * inputted data for the current form session. For example, in create mode (when
 * a new record is being built) both sets of objects are empty. When the use
 * inputs data into each child component, the display* and state/meta objects
 * are mirror objects of each other. However, when in edit mode and initial
 * state is passed down through the form the display state contains the data
 * pulled off of the initial state object. On initial mount state/meta are both
 * empty. When the user edits the data, the meta/state objects get updated. This
 * allows the state/meta objects to contain only the edited data when the form
 * is submitted and not the entire state of the form. If the desire is to handle
 * the full state of the current form, use displayState instead which contains
 * both the changed and unchanged data.
 *
 * @param props - props passed down to the form
 */
const Form: React.SFC<FormProps> = (props: FormProps) => {
  const formState = useFormState();
  const formErrors = useFormError();
  const formLoading = useFormLoading();
  const formMounting = useFormMounting();

  const formRequired = useRequired(
    formState.getComponentState,
    formErrors.getComponentError
  );

  const loading = formLoading.formLoading() || props.loading;

  return (
    <FormContext.Provider
      value={{
        getComponentState: formState.getComponentState,
        getFormState: formState.getFormState,
        getComponentMeta: formState.getComponentMeta,
        getFormMeta: formState.getFormMeta,
        setFormState: formState.setFormState, // sets state and meta (optional)
        removeFormState: formState.removeFormState,
        setInitialState: formState.setInitialState,
        getFormErrors: formErrors.getFormErrors,
        getComponentError: formErrors.getComponentError,
        setFormError: formErrors.setFormError,
        removeFormError: formErrors.removeFormError,
        onButtonClick: (buttonID = 'submit', buttonData = {}) => {
          props.onButtonClick &&
            props.onButtonClick(
              /* FormEvent object */ {
                id: buttonID,
                type: 'buttonClick',
                state: {
                  ...formState.formState,
                  formLoading: loading == undefined ? false : loading,
                  formMounting,
                  initialState: props.initialState || {},
                },
                errors: { formErrors: formErrors.formErrors },
                // additional props passed from button
                buttonData,
                formRequired: {
                  required: formRequired.getFormRequired(),
                  anyMissing: formRequired.anyMissing(),
                },
              }
            );
        },
        initialState: props.initialState!,
        formLoading: loading!,
        formMounting,
        enableLoading: formLoading.enableLoading,
        disableLoading: formLoading.disableLoading,
        isLoading: formLoading.isLoading,
        setRequired: formRequired.setRequired,
        isMissing: formRequired.isMissing,
        anyMissing: formRequired.anyMissing,
        getComponentRequired: formRequired.getComponentRequired,
        getFormRequired: formRequired.getFormRequired,
      }}
    >
      <form onSubmit={e => e.preventDefault()}>{props.children}</form>
    </FormContext.Provider>
  );
};

Form.defaultProps = {
  initialState: {},
  loading: false,
};

export default Form;
export { withFormContext as connectToForm };
