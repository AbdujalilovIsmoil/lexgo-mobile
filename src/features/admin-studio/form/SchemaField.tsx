import { humanizeSlug } from "@/shared/lib/format";
import type { StudioField } from "@/entities/admin-studio";
import { BoolField } from "./BoolField";
import { ChoiceField, MultiChoiceField } from "./ChoiceField";
import { JsonField } from "./JsonField";
import { NestedList } from "./NestedList";
import { NestedObject } from "./NestedObject";
import { NumberField } from "./NumberField";
import { RefField } from "./RefField";
import { TagsField } from "./TagsField";
import { TextField } from "./TextField";
import { errorFor, list, str, strList, withKey } from "./values";
import type { Errors } from "./types";
import type { Dict } from "@/shared/lib/json";

type Props = { f: StudioField; payload: Dict; onChange: (next: Dict) => void; errors: Errors; readOnly: boolean };

// One payload field drawn from its schema entry (type, options or reference source).
export function SchemaField({ f, payload, onChange, errors, readOnly }: Props) {
  const v = payload[f.key];
  const set = (x: unknown) => onChange(withKey(payload, f.key, x));
  const c = { label: f.label || humanizeSlug(f.key), readOnly, error: errorFor(errors, f.key), required: f.required };
  const sub = (p: StudioField, row: Dict, put: (r: Dict) => void, errs: Errors) => <SchemaField f={p} payload={row} onChange={put} errors={errs} readOnly={readOnly} />;
  const one = (v1: string) => (v1 ? [v1] : []);
  switch (f.type) {
    case "textarea":
    case "richtext":
      return <TextField {...c} value={str(v)} onChange={set} multiline hint={f.help} />;
    case "number":
    case "money":
      return <NumberField {...c} value={v} onChange={set} hint={f.help} />;
    case "boolean":
      return <BoolField label={c.label} value={v === true} onChange={set} readOnly={readOnly} hint={f.help} />;
    case "select":
      if (f.options.length) return <ChoiceField {...c} options={f.options} value={str(v)} onChange={set} />;
      return f.source ? <RefField {...c} source={f.source} value={one(str(v))} onChange={(a) => set(a[0] ?? "")} /> : <TextField {...c} value={str(v)} onChange={set} />;
    case "multiselect":
      if (f.options.length) return <MultiChoiceField {...c} options={f.options} value={strList(v)} onChange={set} />;
      return f.source ? <RefField {...c} source={f.source} multi value={strList(v)} onChange={set} /> : <TagsField {...c} value={strList(v)} onChange={set} />;
    case "list":
      if (f.item?.props) return <NestedList f={f} label={c.label} value={v} onChange={set} errors={errors} readOnly={readOnly} renderField={sub} />;
      return list(v).every((x) => typeof x !== "object") && !f.source ? <TagsField {...c} value={strList(v)} onChange={set} /> : f.source ? <RefField {...c} source={f.source} multi value={strList(v)} onChange={set} /> : <JsonField {...c} value={v} empty={[]} onChange={set} />;
    case "object":
      if (f.props) return <NestedObject f={f} label={c.label} value={v} onChange={set} errors={errors} renderField={sub} />;
      return <JsonField {...c} value={v} empty={{}} onChange={set} />;
    default:
      return f.source ? <RefField {...c} source={f.source} value={one(str(v))} onChange={(a) => set(a[0] ?? "")} /> : <TextField {...c} value={str(v)} onChange={set} hint={f.type === "datetime" ? "YYYY-MM-DDTHH:mm" : f.help} />;
  }
}
