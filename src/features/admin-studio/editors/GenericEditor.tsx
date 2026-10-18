import { SchemaFields } from "../form/SchemaFields";
import type { EditorEntry, EditorProps } from "../form/types";

// Every constructor without a special editor: the whole payload drawn from its schema.
function GenericEditor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  return <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} />;
}

export const GENERIC: EditorEntry = { Editor: GenericEditor, validate: () => ({}), emptyPayload: () => ({}), handled: [] };
