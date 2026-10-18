import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { gradient, radius } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type ItemProps = { icon: IconName; title: string; sub: string; colors: readonly [string, string, ...string[]]; onPress: () => void };

function Item({ icon, title, sub, colors, onPress }: ItemProps) {
  return (
    <PressableScale onPress={onPress} scale={0.96} accessibilityRole="button" style={s.item}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fill}>
        <View style={s.ring} pointerEvents="none" />
        <View style={s.badge}><Icon name={icon} size={22} tone="white" /></View>
        <View style={s.col}>
          <Text variant="small" weight="bold" style={s.white} numberOfLines={2}>{title}</Text>
          <Text variant="caption" style={s.soft} numberOfLines={2}>{sub}</Text>
        </View>
        <View style={s.go}><Icon name="arrow-up-right" size={14} tone="white" /></View>
      </LinearGradient>
    </PressableScale>
  );
}

// The two ways in above the catalogue, side by side: the AI intake (web /portal/client/intake), or call an advocate at once.
export function CatalogActions() {
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={s.row}>
      <Item icon="zap" title={t("csv.aiHelp")} sub={t("csv.aiHelpSub")} colors={gradient.primary} onPress={() => router.push("/intake")} />
      <Item icon="alert-triangle" title={t("csv.urgent")} sub={t("csv.urgentSub")} colors={["#E5484D", "#B42318"]} onPress={() => router.push("/sos")} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  item: { flex: 1, borderRadius: radius.rl, overflow: "hidden" },
  fill: { minHeight: 148, padding: 14, gap: 10, justifyContent: "space-between", overflow: "hidden" },
  ring: { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 14, borderColor: "rgba(255,255,255,0.12)", right: -40, top: -40 },
  badge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  col: { gap: 2 },
  white: { color: "#FFFFFF" },
  soft: { color: "rgba(255,255,255,0.86)" },
  go: { position: "absolute", right: 10, top: 10, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
});
