import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { SchemaFields } from "../form/SchemaFields";
import { TextField } from "../form/TextField";
import type { EditorEntry, EditorProps } from "../form/types";
import { moveItem, recList, str } from "../form/values";
import { FieldRows } from "./FieldRows";
import { K05Rules } from "./K05Rules";
import { allFieldNames, rulesOf, sectionsOf, validateK05 } from "./k05Logic";

const HANDLED = ["sections", "conditional_rules"];

// K05 intake questionnaire: sections of fields plus "show field when …" rules.
function K05Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const sections = sectionsOf(payload.sections);
  const set = (k: string, v: unknown) => onChange({ ...payload, [k]: v });
  const patch = (i: number, p: Dict) => set("sections", sections.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <Block title={t("admStudioB.k05.sections")} hint={t("admStudioB.k05.sectionsHint")} count={sections.length} error={errors.sections}>
        {sections.map((s, i) => (
          <Card key={i} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" weight="bold" tone="gray">#{i + 1}</Text>
              {readOnly ? null : <RowTools index={i} count={sections.length} onMove={(d) => set("sections", moveItem(sections, i, d))} onRemove={() => set("sections", sections.filter((_, j) => j !== i))} />}
            </View>
            <TextField label={t("admStudioB.k05.sectionTitle")} value={str(s.title)} onChange={(v) => patch(i, { title: v })} readOnly={readOnly} error={errors[`sections.${i}.title`]} placeholder={t("admStudioB.k05.sectionTitlePh")} />
            {errors[`sections.${i}.fields`] ? <Text variant="caption" tone="err">{t("admStudioB.err.minOne")}</Text> : null}
            <FieldRows rows={recList(s.fields)} onChange={(rows) => patch(i, { fields: rows })} readOnly={readOnly} errors={errors} prefix={`sections.${i}.fields`} />
          </Card>
        ))}
        {readOnly ? null : <Button title={t("admStudioB.k05.addSection")} icon="plus" variant="soft" size="sm" onPress={() => set("sections", [...sections, { title: "", fields: [] }])} />}
      </Block>
      <K05Rules rules={rulesOf(payload.conditional_rules)} names={allFieldNames(sections)} onChange={(rules) => set("conditional_rules", rules)} readOnly={readOnly} errors={errors} />
    </View>
  );
}

export const K05: EditorEntry = { Editor: K05Editor, validate: validateK05, emptyPayload: () => ({ sections: [{ title: "", fields: [] }], conditional_rules: [] }), handled: HANDLED };
