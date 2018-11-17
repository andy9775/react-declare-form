import { useState, useEffect } from 'react';

/**
 * Before the form has had a chance to mount, this is true. Once the form has
 * mounted mounting state is toggled to false.
 *
 * This allows the form to still display a loading state before all data has
 * loaded/mounted into the store.
 */
const useFormMounting = (): boolean => {
  const [mounting, toggleMounting] = useState(true);

  useEffect(
    () => {
      toggleMounting(false);
    },
    ['form']
  );
  return mounting;
};

export default useFormMounting;
