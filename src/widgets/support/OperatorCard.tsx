import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Step 2: a live operator. A bordered card with a green "live" dot, the reply note and a full-width start button.
export function OperatorCard({ onStart }: { onStart: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={s.head}>
        <View style={s.icon}><Icon name="headphones" size={22} tone="white" /><View style={[s.live, { backgroundColor: c.ok, borderColor: c.surface }]} /></View>
        <View style={s.fill}>
          <Text variant="h3">{t("sp1.opTitle")}</Text>
          <Text variant="small" tone="gray">{t("sp1.opText")}</Text>
        </View>
      </View>
      <View style={[s.note, { backgroundColor: c.tint }]}>
        <Icon name="bell" size={15} color={c.accent} />
        <Text variant="caption" tone="gray" style={s.fill}>{t("sp1.opHint")}</Text>
      </View>
      <PressableScale onPress={onStart} style={s.btn} accessibilityRole="button">
        <Icon name="headphones" size={18} tone="white" />
        <Text variant="body" weight="bold" tone="white">{t("sp1.start")}</Text>
        <Icon name="arrow-right" size={18} tone="white" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, gap: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1, gap: 2 },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center" },
  live: { position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, padding: 10 },
  btn: { height: 50, borderRadius: 25, backgroundColor: "#1668F0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
});
