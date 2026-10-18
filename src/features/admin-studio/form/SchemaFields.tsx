import { View } from "react-native";
import { Text } from "@/shared/ui";
import { useStudioText, type StudioConstructor, type StudioField } from "@/entities/admin-studio";
import type { Dict } from "@/shared/lib/json";
import { Block } from "./Block";
import { SchemaField } from "./SchemaField";
import type { Errors } from "./types";

const LONG = /(text|description|body|content|summary|notes?|answer|instruction|prompt|html|markdown)$/;

// A field with no schema entry (offline / old server): the kind is guessed from its value and name.
function infer(key: string, v: unknown, required: boolean): StudioField {
  const type = Array.isArray(v) ? "list" : typeof v === "boolean" ? "boolean" : typeof v === "number" ? "number" : v && typeof v === "object" ? "object" : LONG.test(key) ? "textarea" : "text";
  return { key, label: "", type, required, section: "", help: "", options: [], source: "" };
}

type Props = { ctor: StudioConstructor | null; payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean; exclude?: string[] };

// The schema-driven part of every editor: all fields of the constructor except `exclude`,
// grouped by section, plus payload keys the schema does not know and errors without a field.
export function SchemaFields({ ctor, payload, onChange, errors, readOnly, exclude = [] }: Props) {
  const { t, fieldErr } = useStudioText();
  const required = new Set(ctor?.required ?? []);
  const schema = ctor?.fields.length ? ctor.fields : [...required].map((k) => infer(k, payload[k], true));
  const known = new Set(schema.map((f) => f.key));
  const extra = Object.keys(payload).filter((k) => !known.has(k) && !exclude.includes(k)).map((k) => infer(k, payload[k], false));
  const fields = [...schema, ...extra].filter((f) => !exclude.includes(f.key) && !f.managed);
  const sections = [...new Set(fields.map((f) => f.section))];
  const orphan = Object.entries(errors).filter(([k]) => ![...known, ...exclude].includes(k.split(/[.[]/)[0]) && k !== "title" && k !== "file");
  return (
    <View style={{ gap: 14 }}>
      {orphan.map(([k, v]) => <Text key={k} variant="small" tone="err">{k !== "_" ? `${k}: ` : ""}{fieldErr(v)}</Text>)}
      {sections.map((s) => {
        const body = fields.filter((f) => f.section === s).map((f) => <SchemaField key={f.key} f={f} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} />);
        return sections.length > 1 && s ? <Block key={s} title={s}>{body}</Block> : <View key={s} style={{ gap: 14 }}>{body}</View>;
      })}
      {!fields.length && !exclude.length ? <Text variant="small" tone="gray">{t("admStudioB.noSchema")}</Text> : null}
    </View>
  );
}
