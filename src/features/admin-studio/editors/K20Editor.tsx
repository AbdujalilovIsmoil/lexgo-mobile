import { View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useStudioText } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { RowTools } from "../form/RowTools";
import { SchemaFields } from "../form/SchemaFields";
import { TextField } from "../form/TextField";
import type { EditorEntry, EditorProps, Errors } from "../form/types";
import { moveItem, recList, str } from "../form/values";

const HANDLED = ["steps"];
const ROLES = ["studio_reviewer", "studio_publisher", "studio_admin", "admin"];
const stepsOf = (v: unknown): Dict[] => recList(v).map((s) => ({ ...s, role: str(s.role), title: str(s.title ?? s.name) }));

function validateK20(payload: Dict): Errors {
  const out: Errors = {};
  const steps = stepsOf(payload.steps);
  if (!steps.length) out.steps = "@minOne";
  steps.forEach((s, i) => {
    if (!s.role) out[`steps.${i}.role`] = "@required";
    if (!str(s.title).trim()) out[`steps.${i}.title`] = "@required";
  });
  return out;
}

// K20 approval route stored as a studio object: ordered steps (role + title) and a path preview.
function K20Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const { role } = useStudioText();
  const steps = stepsOf(payload.steps);
  const setSteps = (next: Dict[]) => onChange({ ...payload, steps: next });
  const patch = (i: number, p: Dict) => setSteps(steps.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <Block title={t("admStudioB.k20.steps")} hint={t("admStudioB.k20.stepsHint")} count={steps.length} error={errors.steps}>
        {steps.map((s, i) => (
          <Card key={i} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" weight="bold" tone="gray">#{i + 1}</Text>
              {readOnly ? null : <RowTools index={i} count={steps.length} onMove={(d) => setSteps(moveItem(steps, i, d))} onRemove={() => setSteps(steps.filter((_, j) => j !== i))} />}
            </View>
            <SelectField label={t("admStudioB.k20.role")} value={str(s.role)} options={ROLES.map((r) => ({ value: r, label: role(r) }))} onChange={(v) => !readOnly && patch(i, { role: v })} error={errors[`steps.${i}.role`] ? t("admStudioB.err.required") : undefined} />
            <TextField label={t("admStudioB.k20.stepTitle")} value={str(s.title)} onChange={(v) => patch(i, { title: v })} readOnly={readOnly} error={errors[`steps.${i}.title`]} placeholder={s.role ? role(str(s.role)) : t("admStudioB.k20.stepTitlePh")} />
          </Card>
        ))}
        {readOnly ? null : <Button title={t("admStudioB.k20.add")} icon="plus" variant="soft" size="sm" onPress={() => setSteps([...steps, { role: "studio_reviewer", title: "" }])} />}
        {steps.length ? <Text variant="small" tone="gray">{[t("admStudioB.k20.start"), ...steps.map((s) => str(s.title).trim() || (s.role ? role(str(s.role)) : "—")), t("admStudioB.k20.end")].join(" → ")}</Text> : null}
      </Block>
    </View>
  );
}

export const K20: EditorEntry = {
  Editor: K20Editor,
  validate: validateK20,
  emptyPayload: () => ({ steps: [{ role: "studio_reviewer", title: "" }, { role: "studio_publisher", title: "" }], status: "active", final_action: "approve" }),
  handled: HANDLED,
};
