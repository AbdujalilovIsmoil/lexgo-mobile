import { StyleSheet, View } from "react-native";
import { EXP_POSITIONS_MAX, type ExpPositionInput, type PosIssue } from "@/entities/pro-experience";
import { Button, DatePickerField, IconButton, Input, Text } from "@/shared/ui";
import { Field, SwitchField } from "@/shared/ui/admin";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = {
  rows: ExpPositionInput[];
  full: boolean;
  today: string;
  issue: (row: ExpPositionInput, kind: PosIssue) => string | undefined;
  error?: string; // what the server said about the positions as a whole
  onPatch: (key: string, p: Partial<ExpPositionInput>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
};

// The positions held at one workplace (1 to 30): a title, a start day, an end day or "current position", and an optional description each.
// Periods may overlap or run in parallel — the backend merges them for the rating — so rows are never compared with each other.
export function PositionsEditor({ rows, full, today, issue, error, onPatch, onAdd, onRemove }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <Field label={t("pxp.pos.title")} hint={t("pxp.pos.hint")} error={error}>
      <View style={s.col}>
        {rows.map((r, i) => (
          <View key={r.key} style={[s.row, { backgroundColor: c.surface2 }]}>
            <View style={s.head}>
              <Text variant="small" weight="bold" style={s.flex}>{t("pxp.pos.row", { n: i + 1 })}</Text>
              {rows.length > 1 ? <IconButton icon="trash-2" size={36} label={t("pxp.pos.remove", { n: i + 1 })} onPress={() => onRemove(r.key)} /> : null}
            </View>
            <Input label={t("mf.exp.position")} value={r.title} onChangeText={(x) => onPatch(r.key, { title: x })} maxLength={255} error={issue(r, "title")} />
            <DatePickerField label={t("mf.exp.startedAt")} value={r.startedOn} onChange={(x) => onPatch(r.key, { startedOn: x })} max={today} years error={issue(r, "started")} />
            <SwitchField label={t("pxp.pos.current")} value={r.isCurrent} onChange={(x) => onPatch(r.key, { isCurrent: x, endedOn: x ? "" : r.endedOn })} />
            {!r.isCurrent ? <DatePickerField label={t("mf.exp.endedAt")} value={r.endedOn} onChange={(x) => onPatch(r.key, { endedOn: x })} min={r.startedOn || undefined} max={today} years error={issue(r, "ended")} /> : null}
            <Input label={t("pxp.pos.description")} value={r.description} onChangeText={(x) => onPatch(r.key, { description: x })} multiline maxLength={5000} style={s.area} />
          </View>
        ))}
        {full ? <Text variant="caption" tone="gray">{t("pxp.pos.limit", { n: EXP_POSITIONS_MAX })}</Text> : <Button title={t("pxp.pos.add")} icon="plus" variant="soft" size="sm" onPress={onAdd} style={s.add} />}
      </View>
    </Field>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { gap: 12, padding: 12, borderRadius: radius.rl },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  area: { minHeight: 72, textAlignVertical: "top" },
  add: { alignSelf: "flex-start" },
});
