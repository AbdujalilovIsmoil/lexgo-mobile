import { View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SchemaFields } from "../form/SchemaFields";
import type { EditorEntry, EditorProps } from "../form/types";
import { errorsUnder } from "../form/values";
import { K03MTier } from "./K03MTier";
import { tiersOf, validateK03M } from "./k03mLogic";

const HANDLED = ["tiers"];

// K03-M package: schema fields (code, title, category, components, custom items …) plus exactly three tiers.
function K03MEditor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const tiers = tiersOf(payload.tiers);
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      {errors.tiers ? <Text variant="small" tone="err">{t("ntd.studioV2.err.tiers")}</Text> : null}
      {tiers.map((x, i) => <K03MTier key={String(x.tier)} tier={x} errors={errorsUnder(errors, `tiers.${i}`)} readOnly={readOnly} onPatch={(p) => onChange({ ...payload, tiers: tiers.map((y, j) => (j === i ? { ...y, ...p } : y)) })} />)}
      <Text variant="caption" tone="gray">{t("ntd.studioV2.tiersNote")}</Text>
    </View>
  );
}

export const K03M: EditorEntry = { Editor: K03MEditor, validate: validateK03M, emptyPayload: () => ({ components: [], custom_items: [], tiers: tiersOf([]), is_active: false }), handled: HANDLED };
