import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, Pill, Text } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { channelsOf, kindIcon, kindTint, useUrgentLabels } from "@/entities/urgent";
import type { OrderFormState } from "../model/useOrderForm";

// Top of the order: the service in its own colour — icon, name, what it is in one sentence, and the facts that decide it
// (channel, length, "instant"). The total stays pinned at the foot of the screen.
export function OrderBanner({ f }: { f: OrderFormState }) {
  const { t } = useT();
  const label = useUrgentLabels();
  const sv = f.service;
  if (!sv) return null;
  const tint = kindTint(sv.key);
  return (
    <LinearGradient colors={[tint, "#0A1428"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} style={s.box}>
      <View style={s.mark} pointerEvents="none"><Icon name={kindIcon(sv.key)} size={130} color="rgba(255,255,255,0.1)" /></View>
      <View style={s.head}>
        <View style={s.icon}><Icon name={kindIcon(sv.key)} size={24} tone="white" /></View>
        <Text variant="h3" tone="white" style={s.flex}>{label.kind(sv.key, sv.title)}</Text>
      </View>
      <Text variant="small" style={s.dim}>{t(`ug1.about.${sv.key}`)}</Text>
      <View style={s.pills}>
        {channelsOf(sv).includes(f.channel) ? <Pill small tone="gray" icon={f.channel === "chat" ? "message-circle" : "video"} label={t(f.channel === "chat" ? "ug4.ch.chat" : "ug4.ch.video")} /> : null}
        {f.minutes ? <Pill small tone="gray" icon="clock" label={t("ug4.minutesN", { n: f.minutes })} /> : null}
        {sv.immediateCall ? <Pill small tone="warn" icon="zap" label={t("ug4.now")} /> : null}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { gap: 10, padding: 16, borderRadius: radius.rx, overflow: "hidden" },
  mark: { position: "absolute", right: -22, bottom: -28 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  flex: { flex: 1 },
  dim: { color: "rgba(255,255,255,0.86)" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
