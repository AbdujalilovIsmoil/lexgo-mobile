import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, gradient, radius, shadows } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The top of the client base: a gradient card with the three numbers that matter (all clients, with active cases, with a conflict)
// and the two things you do here — add a client (white, primary) and check a conflict (glass).
export function ClientsHero({ total, active, conflicts, onAdd, onCheck }: { total: number; active: number; conflicts: number; onAdd: () => void; onCheck: () => void }) {
  const { t } = useT();
  const stats = [[total, t("cln.total")], [active, t("cln.active")], [conflicts, t("cln.conflict")]] as const;
  return (
    <LinearGradient colors={[...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.s2]}>
      <View style={s.ring} pointerEvents="none" />
      <View style={s.row}>
        {stats.map(([n, label], i) => (
          <View key={label} style={[s.stat, i ? s.sep : null]}>
            <Text variant="h2" tone="white">{n}</Text>
            <Text variant="caption" numberOfLines={2} style={s.lbl}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={s.actions}>
        <PressableScale onPress={onAdd} accessibilityRole="button" style={[s.btn, s.primary]}>
          <Icon name="user-plus" size={17} color={brand.b900} /><Text variant="small" weight="bold" style={{ color: brand.b900 }}>{t("aw3.add")}</Text>
        </PressableScale>
        <PressableScale onPress={onCheck} accessibilityRole="button" style={[s.btn, s.glass]}>
          <Icon name="shield" size={17} tone="white" /><Text variant="small" weight="bold" tone="white">{t("aw3.check")}</Text>
        </PressableScale>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { gap: 16, padding: 16, borderRadius: radius.rl, overflow: "hidden", marginBottom: 14 },
  ring: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 24, borderColor: "rgba(255,255,255,0.07)", right: -60, top: -70 },
  row: { flexDirection: "row" },
  stat: { flex: 1, gap: 2, paddingLeft: 12 },
  sep: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.18)" },
  lbl: { color: "#C4DEFF" },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 23 },
  primary: { backgroundColor: "#FFFFFF" },
  glass: { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
});
