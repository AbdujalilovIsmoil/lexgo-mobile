import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { OrderFormState } from "../model/useOrderForm";

// What the client should know before pressing send — read from the catalog, never promised by the app —
// as a short timeline: each fact on its own coloured bubble, joined by a rail.
export function OrderSummary({ f }: { f: OrderFormState }) {
  const { t } = useT();
  const c = useColors();
  const s = f.service;
  if (!s) return null;
  const per = s.variants.find((v) => v.channel === f.channel)?.pricePerLawyer ?? 0;
  const rows: { icon: IconName; color: string; text: string }[] = [
    ...(f.minutes ? [{ icon: "clock" as const, color: c.accent, text: t("ug2.meetingLen", { n: f.minutes }) }] : []),
    ...(f.isGroup && per ? [{ icon: "users" as const, color: "#7A5CFF", text: t("ug2.perLawyer", { price: fmtMoney(per), n: f.count }) }] : []),
    { icon: "check", color: c.ok, text: t(f.isGroup ? "ug2.nextGroup" : "ug2.next") },
    ...(s.immediateCall ? [{ icon: "zap" as const, color: c.warn, text: t("ug2.onDuty") }, { icon: "phone" as const, color: c.accent, text: t("ug2.audioNote") }] : []),
    { icon: "message-circle", color: "#00A870", text: t("ug2.filesInChat") },
  ];
  return (
    <View style={[st.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[st.rail, { backgroundColor: c.line }]} />
      {rows.map((r) => (
        <View key={r.text} style={st.row}>
          <View style={[st.bubble, { backgroundColor: `${r.color}22`, borderColor: c.surface }]}><Icon name={r.icon} size={15} color={r.color} /></View>
          <Text variant="small" tone="gray" style={st.flex}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  card: { gap: 14, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  rail: { position: "absolute", left: 27, top: 28, bottom: 28, width: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  bubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  flex: { flex: 1 },
});
