import { isObjList, isPlain, isStrList, labelOf } from "@/entities/admin-policies";
import { SwitchField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ListField } from "./ListField";
import { NumField } from "./NumField";
import { ObjectGroup } from "./ObjectGroup";
import { ObjectList } from "./ObjectList";
import { RawJson } from "./RawJson";

// One field of a policy, typed by its value: switch, number, text, list of texts, list of
// objects, nested object — and JSON text only when the shape is not known.
export function PolicyNode({ name, value, onChange }: { name: string; value: unknown; onChange: (v: unknown) => void }) {
  const { t } = useT();
  const known = (k: string) => (t(k) !== k ? t(k) : "");
  const label = known(`admPolB.keys.${name}`) || known(`admSt.${name}`) || labelOf(name);
  const node = (n: string, v: unknown, cb: (x: unknown) => void) => <PolicyNode name={n} value={v} onChange={cb} />;
  if (typeof value === "boolean") return <SwitchField label={label} value={value} onChange={onChange} />;
  if (typeof value === "number") return <NumField label={label} value={value} onChange={onChange} />;
  if (value === null || value === undefined || typeof value === "string") {
    return <Input label={label} value={value ?? ""} onChangeText={(v) => onChange(v === "" && value === null ? null : v)} multiline={typeof value === "string" && value.length > 60} autoCapitalize="none" />;
  }
  if (isStrList(value)) return <ListField label={label} value={value} onChange={onChange} />;
  if (isObjList(value)) return <ObjectList label={label} value={value} onChange={onChange} renderNode={node} />;
  if (isPlain(value)) {
    const title = typeof value.title === "string" && value.title ? `${value.title}` : "";
    return <ObjectGroup label={title && /^[0-9a-f-]{20,}$/i.test(name) ? title : label} value={value} onChange={onChange} renderNode={node} />;
  }
  return <RawJson label={label} value={value} onChange={onChange} />;
}
