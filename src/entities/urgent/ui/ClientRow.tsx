import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { chatHref } from "../model/hrefs";
import type { UrgentRequest } from "../model/requestTypes";
import { useUrgentLabels } from "../model/useLabels";
import { kindIcon, statusTint } from "./kindIcon";
import { StatusBadge } from "./StatusBadge";

// The client's own request as a card with a rail in its status colour: service + status, work id and date, what they asked
// in a quote block, the time / panel / call lines, and the two actions (chat once there is one, details). `fresh` = just made.
export function ClientRow({ item, fresh, onPress }: { item: UrgentRequest; fresh?: boolean; onPress: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const label = useUrgentLabels();
  const tint = fresh ? "#00A870" : statusTint(item.status || "open_pool");
  const call = [item.callStatus ? label.call(item.callStatus) : "", item.callChannel ? label.channel(item.callChannel) : ""].filter(Boolean).join(" · ");
  const line = (icon: IconName, text: string, color?: string) => (
    <View style={s.line}><Icon name={icon} size={14} color={color ?? c.gray} /><Text variant="caption" weight="semibold" style={[s.flex, color ? { color } : { color: c.gray }]}>{text}</Text></View>
  );
  return (
    <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" style={[s.card, { backgroundColor: c.surface, borderColor: fresh ? tint : c.line }]}>
      <View style={[s.rail, { backgroundColor: tint }]} />
      <View style={s.body}>
        <View style={s.head}>
          <View style={[s.icon, { backgroundColor: `${tint}22` }]}><Icon name={kindIcon(item.serviceKind)} size={20} color={tint} /></View>
          <View style={s.flex}>
            <Text variant="h4">{label.kind(item.serviceKind, item.serviceTitle)}</Text>
            {item.workId ? <Text variant="caption" weight="bold" tone="accent">{item.workId}</Text> : null}
            <Text variant="caption" tone="gray2">{fmtDateTime(item.createdAt, locale)}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        {item.need ? <View style={[s.quote, { backgroundColor: c.surface2 }]}><Text variant="small" numberOfLines={3}>{item.need}</Text></View> : null}
        {item.scheduledAt ? line("clock", t("ug4.scheduledFor", { when: fmtDateTime(item.scheduledAt, locale) })) : null}
        {item.groupLawyers.length ? line("users", t("ntd.ugPanelOf", { names: item.groupLawyers.map((g) => g.name).join(", ") })) : null}
        {call ? line("phone", call, item.callStatus === "calling" ? c.ok : undefined) : null}
        {item.viaOperator ? line("headphones", t("ug4.byOperator"), c.accent) : null}
        <View style={s.acts}>
          {item.roomId ? <Button title={t("ntd.ugOpenChat")} icon="message-circle" size="sm" variant="line" style={s.flex} onPress={() => router.push(chatHref(item.roomId))} /> : null}
          <Button title={t("ntd.ugDetails")} icon="chevron-right" size="sm" variant="soft" style={s.flex} onPress={onPress} />
        </View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1.5, overflow: "hidden" },
  rail: { width: 5 },
  body: { flex: 1, gap: 10, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  quote: { padding: 10, borderRadius: 12 },
  line: { flexDirection: "row", alignItems: "center", gap: 7 },
  acts: { flexDirection: "row", gap: 8, marginTop: 2 },
});
