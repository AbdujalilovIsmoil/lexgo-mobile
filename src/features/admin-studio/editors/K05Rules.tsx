import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import { MultiChips, SelectField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { moveItem, str, strList } from "../form/values";
import { NEEDS_VALUE, OPERATORS } from "./k05Logic";

type Props = { rules: Dict[]; names: string[]; onChange: (next: Dict[]) => void; readOnly: boolean; errors: Errors };

// "If field <operator> value, then show these fields" rules of the questionnaire.
export function K05Rules({ rules, names, onChange, readOnly, errors }: Props) {
  const { t } = useT();
  const patch = (i: number, p: Dict) => onChange(rules.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const opts = names.map((n) => ({ value: n, label: n }));
  return (
    <Block title={t("admStudioB.k05.rules")} hint={t("admStudioB.k05.rulesHint")} count={rules.length} error={errors.conditional_rules}>
      {rules.length === 0 ? <Text variant="small" tone="gray">{names.length ? t("admStudioB.k05.rulesNone") : t("admStudioB.k05.rulesNeedFields")}</Text> : null}
      {rules.map((r, i) => {
        const e = (k: string) => errors[`conditional_rules.${i}.${k}`] ?? "";
        return (
          <Card key={i} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" weight="bold" tone="gray">{t("admStudioB.k05.if")} #{i + 1}</Text>
              {readOnly ? null : <RowTools index={i} count={rules.length} onMove={(d) => onChange(moveItem(rules, i, d))} onRemove={() => onChange(rules.filter((_, j) => j !== i))} />}
            </View>
            <SelectField label={t("admStudioB.k05.ruleField")} value={str(r.field)} options={opts} onChange={(v) => !readOnly && patch(i, { field: v })} error={e("field") ? t("admStudioB.err.rule") : undefined} />
            <SelectField label={t("admStudioB.k05.operator")} value={str(r.operator)} options={OPERATORS.map((o) => ({ value: o, label: t(`admStudioB.k05.op.${o}`) }))} onChange={(v) => !readOnly && patch(i, { operator: v })} />
            {NEEDS_VALUE.includes(str(r.operator)) ? <TextField label={t("admStudioB.k05.value")} value={str(r.value)} onChange={(v) => patch(i, { value: v })} readOnly={readOnly} error={e("value")} /> : null}
            <Text variant="small" tone="gray">{t("admStudioB.k05.show")}</Text>
            <MultiChips options={opts.filter((o) => o.value !== str(r.field))} value={strList(r.show_fields)} onChange={(v) => !readOnly && patch(i, { show_fields: v })} />
            {e("show_fields") ? <Text variant="caption" tone="err">{t("admStudioB.err.required")}</Text> : null}
          </Card>
        );
      })}
      {readOnly || !names.length ? null : <Button title={t("admStudioB.k05.addRule")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...rules, { field: names[0], operator: "not_empty", show_fields: [] }])} />}
    </Block>
  );
}
