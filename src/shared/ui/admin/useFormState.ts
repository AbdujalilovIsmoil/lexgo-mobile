import { useCallback, useState } from "react";

// Small controlled-form state: values, a typed setter per key, reset to the initial values.
export function useFormState<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value })), []);
  const reset = useCallback((next?: T) => setValues(next ?? initial), [initial]);
  return { values, set, reset, setAll: setValues };
}
