import { View } from "react-native";
import { Button, Card, Chip, Text } from "@/shared/ui";
import { SwitchField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { RowTools } from "../../form/RowTools";
import { TextField } from "../../form/TextField";
import type { Errors } from "../../form/types";
import { moveItem, recList, strList } from "../../form/values";
import { METHODS, PROOF, newRow, normRow, rowErr } from "./k02Logic";

type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// The completion checklist: add, edit, reorder and remove rows locally. The tick is on every row and cannot be switched off; comment,
// image and file are extra proof, each with its own "required" switch that works only while that proof is chosen. A row's id is never
// typed: a new row has none (the backend makes it) and an existing row keeps its own.
export function K02Checklist({ payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const rows = recList(payload.completion_checklist);
  const set = (next: Dict[]) => onChange({ ...payload, completion_checklist: next });
  const patch = (i: number, p: Dict) => set(rows.map((r, j) => (j === i ? normRow({ ...r, ...p }) : r)));
  return (
    <Block title={t("admStudioD.k02.checklist")} hint={t("admStudioD.k02.checklistHint")} count={rows.length} error={errors.completion_checklist}>
      {rows.map((r, i) => {
        const methods = strList(r.verification_methods);
        return (
          <Card key={String(r.id ?? i)} style={{ gap: 10 }}>
            {readOnly ? null : <View style={{ alignSelf: "flex-end" }}><RowTools index={i} count={rows.length} onMove={(d) => set(moveItem(rows, i, d))} onRemove={() => set(rows.filter((_, j) => j !== i))} /></View>}
            <TextField label={t("admStudioD.k02.rowTitle")} value={String(r.title ?? "")} onChange={(v) => patch(i, { title: v })} readOnly={readOnly} error={rowErr(errors, "completion_checklist", i, "title")} required />
            <TextField label={t("admStudioD.k02.rowDesc")} value={String(r.description ?? "")} onChange={(v) => patch(i, { description: v })} readOnly={readOnly} multiline />
            <SwitchField label={t("admStudioD.k02.rowRequired")} value={r.required !== false} onChange={(v) => !readOnly && patch(i, { required: v })} />
            <Text variant="small" tone="gray">{t("admStudioD.k02.proof")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {METHODS.map((m) => (
                <Chip key={m} label={t(`admStudioD.k02.methods.${m}`)} icon={m === "checkbox" ? "lock" : undefined} active={methods.includes(m)}
                  onPress={m === "checkbox" || readOnly ? undefined : () => patch(i, { verification_methods: methods.includes(m) ? methods.filter((x) => x !== m) : [...methods, m] })} />
              ))}
            </View>
            {rowErr(errors, "completion_checklist", i, "verification_methods") ? <Text variant="caption" tone="err">{t("admStudioB.err.checkbox")}</Text> : <Text variant="caption" tone="gray2">{t("admStudioD.k02.locked")}</Text>}
            {PROOF.filter((m) => methods.includes(m)).map((m) => (
              <SwitchField key={m} label={`${t(`admStudioD.k02.methods.${m}`)} — ${t("admStudioD.k02.needed")}`} value={r[`${m}_required`] === true} onChange={(v) => !readOnly && patch(i, { [`${m}_required`]: v })} />
            ))}
          </Card>
        );
      })}
      {readOnly ? null : <Button title={t("admStudioD.k02.addRow")} icon="plus" variant="soft" size="sm" onPress={() => set([...rows, newRow()])} />}
    </Block>
  );
}
