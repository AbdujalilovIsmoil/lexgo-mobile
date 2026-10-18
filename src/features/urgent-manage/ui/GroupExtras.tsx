import { View } from "react-native";
import { Input, Text } from "@/shared/ui";
import { DateField, SwitchField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { maskTime } from "../model/maskTime";
import type { GroupForm } from "../model/useGroupForm";

// Optional schedule (date + time) for a video panel, the operator note, the refusal and its matching override.
// A chat panel has no meeting time: the backend opens the group secure chat instead.
export function GroupExtras({ f, chat }: { f: GroupForm; chat: boolean }) {
  const { t } = useT();
  return (
    <View style={{ gap: 12 }}>
      {chat ? (
        <Text variant="caption" tone="gray">{t("ug9.chatHint")}</Text>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}><DateField label={t("adm.date")} value={f.date} onChange={f.setDate} /></View>
            <View style={{ flex: 1 }}><Input label={t("ug9.time")} value={f.time} onChangeText={(v) => f.setTime(maskTime(v))} placeholder="16:00" keyboardType="number-pad" maxLength={5} /></View>
          </View>
          <Text variant="caption" tone="gray">{t("ug9.timeOptional")}</Text>
        </>
      )}
      <Input label={t("adm.note")} value={f.note} onChangeText={f.setNote} placeholder={t("ug9.notePh")} multiline />
      {f.err ? <Text variant="small" tone="err">{f.err}</Text> : null}
      {f.offer === "count" ? <SwitchField label={t("ug9.overrideCount")} hint={t("ug9.overrideCountHint")} value={f.okCount} onChange={f.setOkCount} /> : null}
      {f.offer === "direction" ? <SwitchField label={t("ug9.overrideDirection")} hint={t("ug9.overrideDirectionHint")} value={f.okDir} onChange={f.setOkDir} /> : null}
    </View>
  );
}
