import { Text } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { RefField } from "../../form/RefField";
import { SchemaFields } from "../../form/SchemaFields";
import type { EditorEntry, EditorProps } from "../../form/types";
import { str } from "../../form/values";
import { K02Checklist } from "./K02Checklist";
import { K02Duration } from "./K02Duration";
import { K02Factors } from "./K02Factors";
import { K02Guarantees, K02Rules } from "./K02Inline";
import { K02Template } from "./K02Template";
import { K02Terms } from "./K02Terms";
import { emptyK02, validateK02 } from "./k02Logic";

const HANDLED = [
  "duration_value", "duration_unit", "duration_calendar", "template_mode", "template_source", "document_template_id", "price_factor_ids", "price_factor_overrides",
  "completion_checklist", "checklist_template_id", "rule_ids", "inline_rules", "guarantee_ids", "inline_guarantees", "discovery_terms",
];

// K02, the simple service: the schema's own fields (name, category, description, prices, seller requirements …) and then the blocks
// that need more than a field — duration, template, price factors with per-service values, the completion checklist, rules,
// guarantees and the search terms with AI suggestions.
function K02Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const p = { payload, onChange, errors, readOnly };
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <K02Duration {...p} />
      <K02Template {...p} />
      <K02Factors {...p} />
      <K02Checklist {...p} />
      {str(payload.checklist_template_id) ? (
        <Block title={t("admStudioD.k02.legacy")} hint={t("admStudioD.k02.legacyHint")}>
          <RefField label={t("admStudioD.k02.legacy")} source="/studio/reference/checklists" value={[str(payload.checklist_template_id)]} onChange={(a) => onChange({ ...payload, checklist_template_id: a[0] ?? "" })} readOnly={readOnly} />
        </Block>
      ) : null}
      <K02Rules {...p} />
      <K02Guarantees {...p} />
      <K02Terms {...p} />
      {!ctor ? <Text variant="small" tone="gray">{t("admStudioB.noSchema")}</Text> : null}
    </View>
  );
}

export const K02: EditorEntry = { Editor: K02Editor, validate: validateK02, emptyPayload: emptyK02, handled: HANDLED };
