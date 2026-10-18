import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { SchemaFields } from "../form/SchemaFields";
import { TextField } from "../form/TextField";
import type { EditorEntry, EditorProps, Errors } from "../form/types";
import { SNAKE_RE, moveItem, recList, slugify, str } from "../form/values";

const HANDLED = ["items"];
const itemsOf = (v: unknown): Dict[] => recList(v).map((o) => ({ ...o, label: str(o.label ?? o.title ?? o.name), value: str(o.value ?? o.code ?? o.key) }));

function validateK16(payload: Dict): Errors {
  const out: Errors = {};
  const key = str(payload.directory_key).trim();
  if (key && !SNAKE_RE.test(key)) out.directory_key = "@snake";
  const items = itemsOf(payload.items);
  if (!items.length) out.items = "@minOne";
  const seen = new Map<string, number>();
  items.forEach((it, i) => {
    if (!str(it.label).trim()) out[`items.${i}.label`] = "@required";
    const v = str(it.value).trim();
    if (!v) out[`items.${i}.value`] = "@required";
    else if (seen.has(v)) out[`items.${i}.value`] = out[`items.${seen.get(v)}.value`] = "@duplicate";
    else seen.set(v, i);
  });
  return out;
}

// K16 directory (regions, types …): label + system value rows. Approval-free: publishes on submit.
function K16Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const items = itemsOf(payload.items);
  const setItems = (next: Dict[]) => onChange({ ...payload, items: next });
  const patch = (i: number, p: Dict) => setItems(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  const setLabel = (i: number, label: string) => {
    const auto = !str(items[i].value) || str(items[i].value) === slugify(str(items[i].label));
    patch(i, auto ? { label, value: slugify(label) } : { label });
  };
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admStudioB.k16.note")}</Text>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <Block title={t("admStudioB.k16.items")} hint={t("admStudioB.k16.itemsHint")} count={items.length} error={errors.items}>
        {items.map((it, i) => (
          <Card key={i} style={{ gap: 10 }}>
            {readOnly ? null : <View style={{ alignSelf: "flex-end" }}><RowTools index={i} count={items.length} onMove={(d) => setItems(moveItem(items, i, d))} onRemove={() => setItems(items.filter((_, j) => j !== i))} /></View>}
            <TextField label={t("admStudioB.k16.label")} value={str(it.label)} onChange={(v) => setLabel(i, v)} readOnly={readOnly} error={errors[`items.${i}.label`]} placeholder={t("admStudioB.k16.labelPh")} />
            <TextField label={t("admStudioB.k16.value")} value={str(it.value)} onChange={(v) => patch(i, { value: v })} readOnly={readOnly} error={errors[`items.${i}.value`]} mono />
          </Card>
        ))}
        {readOnly ? null : <Button title={t("admStudioB.k16.add")} icon="plus" variant="soft" size="sm" onPress={() => setItems([...items, { label: "", value: "" }])} />}
      </Block>
    </View>
  );
}

export const K16: EditorEntry = { Editor: K16Editor, validate: validateK16, emptyPayload: () => ({ language: "uz-latn", items: [{ label: "", value: "" }] }), handled: HANDLED };
