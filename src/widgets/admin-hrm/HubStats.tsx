import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PressableScale, Text } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { useHubBadges } from "./useHubBadges";

const ITEMS = [{ key: "tasks", color: "#FBBF24" }, { key: "messages", color: "#F472B6" }, { key: "approvals", color: "#A5B4FC" }] as const;

// Three live numbers on the hub hero (open tasks, unread messages, pending approvals); each jumps to its screen.
export function HubStats() {
  const { t } = useT();
  const router = useRouter();
  const badges = useHubBadges();
  return (
    <View style={s.row}>
      {ITEMS.map((i) => (
        <PressableScale key={i.key} onPress={() => { tapHaptic(); router.push(`/manage/internal/${i.key}` as never); }} scale={0.95} style={s.cell} accessibilityRole="button">
          <Text variant="h2" style={{ color: i.color }}>{badges[i.key] ?? 0}</Text>
          <Text variant="caption" style={s.label} numberOfLines={1}>{t(`admHrm.nav.${i.key}`)}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  label: { color: "#E0E7FF" },
});
