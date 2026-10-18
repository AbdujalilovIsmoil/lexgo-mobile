import { View } from "react-native";
import { Segmented, Text } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useStudioText } from "@/entities/admin-studio";
import { RefField } from "../form/RefField";
import { SchemaFields } from "../form/SchemaFields";
import type { EditorEntry, EditorProps } from "../form/types";
import { recList, str } from "../form/values";
import { K29Sections } from "./K29Sections";
import { TARGETS, validateK29, withTarget } from "./k29Logic";

const HANDLED = ["target_type", "service_id", "package_id", "sections"];

// K29 price options: target (one service or one package), then nested sections > options. No single-select anywhere.
function K29Editor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const { fieldErr } = useStudioText();
  const target = str(payload.target_type) === "package" ? "package" : "service";
  const idKey = `${target}_id`;
  return (
    <View style={{ gap: 14 }}>
      <Field label={`${ctor?.fields.find((f) => f.key === "target_type")?.label ?? t("ntd.studioV2.target")} *`} error={errors.target_type ? fieldErr(errors.target_type) : undefined}>
        <View pointerEvents={readOnly ? "none" : "auto"} style={{ opacity: readOnly ? 0.6 : 1 }}>
          <Segmented options={TARGETS.map((v) => ({ value: v, label: t(`ntd.studioV2.target_${v}`) }))} value={target} onChange={(v) => onChange(withTarget(payload, v))} />
        </View>
      </Field>
      <RefField label={t(`ntd.studioV2.target_${target}`)} source={target === "service" ? "services" : "service-packages"} value={str(payload[idKey]) ? [str(payload[idKey])] : []} onChange={(a) => onChange({ ...withTarget(payload, target), [idKey]: a[0] ?? "" })} readOnly={readOnly} error={errors[idKey]} required />
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <K29Sections sections={recList(payload.sections)} onChange={(s) => onChange({ ...payload, sections: s })} errors={errors} readOnly={readOnly} />
      <Text variant="caption" tone="gray">{t("ntd.studioV2.multiNote")}</Text>
    </View>
  );
}

export const K29: EditorEntry = { Editor: K29Editor, validate: validateK29, emptyPayload: () => ({ target_type: "service", sections: [], is_active: false }), handled: HANDLED };
