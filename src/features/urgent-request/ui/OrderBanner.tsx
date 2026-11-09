import { StyleSheet, View } from "react-native";
import { Icon, Pill, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { channelsOf, kindIcon, kindTint, useUrgentLabels } from "@/entities/urgent";
import type { OrderFormState } from "../model/useOrderForm";

// Top of the order: the service as on its row in the list — the icon on its tile, the name, what it is in one sentence, and the facts that decide it
// (channel, length, "instant"). The total stays pinned at the foot of the screen.
export function OrderBanner({ f }: { f: OrderFormState }) {
  const { t } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const sv = f.service;
  if (!sv) return null;
  const tint = kindTint(sv.key);
  return (
    <View style={[s.box, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: `${tint}1A` }]}><Icon name={kindIcon(sv.key)} size={20} color={tint} /></View>
        <Text variant="h4" weight="semibold" style={s.name}>{label.kind(sv.key, sv.title)}</Text>
      </View>
      <Text variant="small" tone="gray">{t(`ug1.about.${sv.key}`)}</Text>
      <View style={s.pills}>
        {channelsOf(sv).includes(f.channel) ? <Pill small tone="gray" icon={f.channel === "chat" ? "message-circle" : "video"} label={t(f.channel === "chat" ? "ug4.ch.chat" : "ug4.ch.video")} /> : null}
        {f.minutes ? <Pill small tone="gray" icon="clock" label={t("ug4.minutesN", { n: f.minutes })} /> : null}
        {sv.immediateCall ? <Pill small tone="warn" icon="zap" label={t("ug4.now")} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 10, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  name: { flex: 1, fontSize: 15, lineHeight: 20 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
