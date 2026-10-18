import { StyleSheet, View } from "react-native";
import { ORDER_STATUS_TONE } from "@/entities/order";
import { Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Fact } from "./notifInfo";

// Key facts as hairline rows, then the channels the event was delivered on.
export function NotifFacts({ facts, channels }: { facts: Fact[]; channels: string[] }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.col}>
      {facts.length ? (
        <View style={[s.box, { borderColor: c.line }]}>
          {facts.map((f, i) => (
            <View key={f.key} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
              <Text variant="caption" tone="gray">{f.label}</Text>
              {f.status ? <Pill label={f.value} tone={ORDER_STATUS_TONE[f.status] ?? "gray"} small /> : <Text variant="small" weight="semibold" style={s.val} numberOfLines={2}>{f.value}</Text>}
            </View>
          ))}
        </View>
      ) : null}
      {channels.length ? (
        <View style={s.col}>
          <Text variant="caption" tone="gray2">{t("notif.delivered")}</Text>
          <View style={s.chips}>{channels.map((ch) => <Pill key={ch} label={t(`notif.ch.${ch}`) === `notif.ch.${ch}` ? ch : t(`notif.ch.${ch}`)} tone="gray" small />)}</View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 13 },
  val: { flexShrink: 1, textAlign: "right" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
