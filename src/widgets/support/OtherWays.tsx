import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { openTel } from "@/shared/lib/links";
import { SUPPORT_PHONE } from "@/shared/config/env";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ComplaintSheet } from "@/features/rating";
import { scheduleText, useSupportHours } from "@/entities/support";

function Tile({ icon, tint, bg, title, lines, onPress }: { icon: IconName; tint: string; bg: string; title: string; lines: { text: string; bold?: boolean }[]; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={[s.tile, { backgroundColor: bg }]}>
      <View style={[s.ico, { backgroundColor: tint }]}><Icon name={icon} size={18} tone="white" /></View>
      <Text variant="body" weight="bold">{title}</Text>
      {lines.map((l) => <Text key={l.text} variant="caption" weight={l.bold ? "bold" : undefined} tone={l.bold ? "ink" : "gray"} numberOfLines={3}>{l.text}</Text>)}
    </PressableScale>
  );
}

// "Other ways": two equal tiles - call the support line (number + schedule) and file a complaint.
export function OtherWays() {
  const { t } = useT();
  const c = useColors();
  const [form, setForm] = useState(false);
  const hours = useSupportHours().data;
  const sched = hours ? scheduleText(hours, (d) => t(`sp4.days.${d}`)) : "";
  return (
    <View style={s.row}>
      <Tile icon="phone" tint={c.ok} bg={c.okBg} title={t("sp1.callTitle")} lines={[{ text: SUPPORT_PHONE, bold: true }, ...(sched ? [{ text: sched }] : [])]} onPress={() => openTel(SUPPORT_PHONE)} />
      <Tile icon="alert-circle" tint={c.warn} bg={c.warnBg} title={t("sp1.cTitle")} lines={[{ text: t("sp1.cSub") }]} onPress={() => setForm(true)} />
      <ComplaintSheet visible={form} onClose={() => setForm(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  tile: { flex: 1, borderRadius: 22, padding: 14, gap: 4, minHeight: 148 },
  ico: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 6 },
});
