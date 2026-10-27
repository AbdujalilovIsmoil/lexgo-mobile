import { useFormState, useWatch, type FieldValues, type Path, type PathValue, type UseFormReturn } from "react-hook-form";
import { useRaControl } from "./useRaControl";
import { RA_FIELD, raFail, raOk, type RaSensitivity, type RaState } from "./types";

type Opts = { id: string; label: string; sensitivity?: RaSensitivity; actions?: readonly string[] };

// A react-hook-form text field on the operator's map (TZ RA §10). The operator's value goes through the form's own setValue and schema:
// a value the schema refuses is put back and reported as `validation_failed`, so the form is never left holding it. Focus uses the
// field's registered input. Only empty / filled / invalid is published — never the value.
export function useRaField<T extends FieldValues, C, O>(form: UseFormReturn<T, C, O>, name: Path<T>, o: Opts, on = true) {
  const value: unknown = useWatch({ control: form.control, name });
  const fs = useFormState({ control: form.control, name });
  const invalid = form.getFieldState(name, fs).invalid;
  const state: RaState = invalid ? "invalid" : String(value ?? "").trim() ? "filled" : "empty";
  return useRaControl(
    {
      id: o.id,
      label: o.label,
      sensitivity: o.sensitivity,
      actions: o.actions ?? RA_FIELD,
      state,
      focus: () => form.setFocus(name),
      setValue: async (v) => {
        const before = form.getValues(name);
        const wasInvalid = form.getFieldState(name).invalid;
        form.setValue(name, v as PathValue<T, Path<T>>, { shouldDirty: true, shouldTouch: true });
        if (await form.trigger(name)) return raOk({ valid: true });
        form.setValue(name, before, { shouldDirty: true });
        if (wasInvalid) await form.trigger(name);
        else form.clearErrors(name);
        return raFail("validation_failed");
      },
    },
    on,
  );
}
