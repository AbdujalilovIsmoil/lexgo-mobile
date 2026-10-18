import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { BoolField } from "../form/BoolField";
import { RowTools } from "../form/RowTools";
import { TagsField } from "../form/TagsField";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { SNAKE_RE, moveItem, slugify, str, strList } from "../form/values";
import { FIELD_TYPES, normFieldRow } from "./rowsLogic";

type Props = { rows: Dict[]; onChange: (next: Dict[]) => void; readOnly: boolean; errors: Errors; prefix: string };

// Editable list of questionnaire fields (label → key is generated while the key was not edited by hand).
export function FieldRows({ rows, onChange, readOnly, errors, prefix }: Props) {
  const { t } = useT();
  const patch = (i: number, p: Dict) => onChange(rows.map((r, j) => (j === i ? normFieldRow({ ...r, ...p }) : r)));
  const setLabel = (i: number, label: string) => {
    const auto = !str(rows[i].name) || str(rows[i].name) === slugify(str(rows[i].label));
    patch(i, auto ? { label, name: slugify(label) } : { label });
  };
  const tidy = (i: number) => {
    const n = str(rows[i].name);
    if (n && !SNAKE_RE.test(n) && slugify(n)) patch(i, { name: slugify(n) });
  };
  return (
    <View style={{ gap: 10 }}>
      {rows.length === 0 ? <Text variant="small" tone="gray">{t("admStudioB.fields.none")}</Text> : null}
      {rows.map((r, i) => {
        const e = (k: string) => errors[`${prefix}.${i}.${k}`] ?? "";
        return (
          <Card key={i} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" weight="bold" tone="gray">#{i + 1}</Text>
              {readOnly ? null : <RowTools index={i} count={rows.length} onMove={(d) => onChange(moveItem(rows, i, d))} onRemove={() => onChange(rows.filter((_, j) => j !== i))} />}
            </View>
            <TextField label={t("admStudioB.fields.label")} value={str(r.label)} onChange={(v) => setLabel(i, v)} readOnly={readOnly} error={e("label")} />
            <TextField label={t("admStudioB.fields.name")} value={str(r.name)} onChange={(v) => patch(i, { name: v })} onBlur={() => tidy(i)} readOnly={readOnly} error={e("name")} mono />
            <SelectField label={t("admStudioB.fields.type")} value={str(r.type) || "text"} options={FIELD_TYPES.map((v) => ({ value: v, label: t(`admStudioB.fieldType.${v}`) }))} onChange={(v) => !readOnly && patch(i, { type: v })} />
            <BoolField label={t("admStudioB.fields.required")} value={r.required === true} onChange={(v) => patch(i, { required: v })} readOnly={readOnly} />
            {str(r.type) === "select" ? <TagsField label={t("admStudioB.fields.options")} value={strList(r.options)} onChange={(v) => patch(i, { options: v })} readOnly={readOnly} error={e("options")} /> : null}
          </Card>
        );
      })}
      {readOnly ? null : <Button title={t("admStudioB.fields.add")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...rows, { name: "", label: "", type: "text", required: false }])} />}
    </View>
  );
}
