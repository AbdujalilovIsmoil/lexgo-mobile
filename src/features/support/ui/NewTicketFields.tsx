import { StyleSheet, View } from "react-native";
import { FormInput } from "@/shared/form";
import { Icon, Text } from "@/shared/ui";
import { Field, SwitchField } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useSupportLabels } from "@/entities/support";
import type { useNewTicket } from "../model/useNewTicket";
import { TopicChips } from "./TopicChips";

const MAX = 4000;

// Fields of the new-chat window (web "supnew"): problem text, topic chips, urgent switch, AI-history note, error.
export function NewTicketFields({ f }: { f: ReturnType<typeof useNewTicket> }) {
  const { t } = useT();
  const c = useColors();
  const labels = useSupportLabels();
  const hint = f.topic ? undefined : f.auto !== "general" ? t("sp2.autoTopic", { topic: labels.category(f.auto) }) : t("sp2.autoHint");
  return (
    <>
      <FormInput control={f.control} name="message" label={t("sp2.message")} placeholder={t("sp2.messagePh")} multiline maxLength={MAX} hint={`${f.message.length}/${MAX}`} style={s.area} />
      <Field label={t("sp2.topic")} hint={hint}><TopicChips topics={f.topics} value={f.topic} onChange={f.setTopic} /></Field>
      <SwitchField label={t("sp2.urgent")} hint={t("sp2.urgentHint")} value={f.urgent} onChange={f.setUrgent} />
      {f.error ? <Text variant="small" tone="err">{f.error}</Text> : null}
      {f.shared ? <View style={s.note}><Icon name="zap" size={14} color={c.accent} /><Text variant="caption" tone="gray" style={s.fill}>{t("sp2.aiShared")}</Text></View> : null}
    </>
  );
}

const s = StyleSheet.create({
  area: { minHeight: 120, textAlignVertical: "top", paddingTop: 12 },
  note: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
});
