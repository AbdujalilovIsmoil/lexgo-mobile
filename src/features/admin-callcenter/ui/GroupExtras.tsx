import { View } from "react-native";
import { FormInput } from "@/shared/form";
import { Text } from "@/shared/ui";
import { DateField, SwitchField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { maskTime } from "../model/maskTime";
import type { GroupForm } from "../model/useGroupForm";

// Optional schedule (date + time), operator note, the refusal message and the matching override.
export function GroupExtras({ f }: { f: GroupForm }) {
  const { t } = useT();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><DateField label={t("adm.date")} value={f.date} onChange={f.setDate} /></View>
        <View style={{ flex: 1 }}><FormInput control={f.form.control} name="time" label={t("admCcB.time")} format={maskTime} placeholder="16:00" keyboardType="number-pad" maxLength={5} /></View>
      </View>
      <Text variant="caption" tone="gray">{t("admCcB.timeOptional")}</Text>
      <FormInput control={f.form.control} name="note" label={t("adm.note")} maxLength={1000} placeholder={t("admCcB.groupNotePh")} multiline />
      {f.err ? <Text variant="small" tone="err">{f.err}</Text> : null}
      {f.offer === "count" ? <SwitchField label={t("admCcB.overrideCount")} hint={t("admCcB.overrideCountHint")} value={f.okCount} onChange={f.setOkCount} /> : null}
      {f.offer === "direction" ? <SwitchField label={t("admCcB.overrideDirection")} hint={t("admCcB.overrideDirectionHint")} value={f.okDir} onChange={f.setOkDir} /> : null}
    </View>
  );
}
