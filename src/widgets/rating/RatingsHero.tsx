import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stars } from "@/entities/rating";
import { brand, radius, shadows } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The client's rating habit on a gradient card: the average of the stars given (big), how many ratings, and — warm —
// how many finished works still wait to be rated.
export function RatingsHero({ avg, count, waiting }: { avg: number; count: number; waiting: number }) {
  const { t } = useT();
  return (
    <LinearGradient colors={[brand.b800, brand.b600, "#0E9FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <View style={s.row}>
        <View style={s.flex}>
          <Text variant="small" tone="white" style={s.soft}>{t("rtx.avg")}</Text>
          <Text variant="hx" tone="white">{count ? avg.toFixed(1) : "—"}</Text>
        </View>
        <View style={s.stars}><Stars value={Math.round(avg)} size={22} /><Text variant="caption" tone="white" style={s.soft}>{t("rtx.count", { n: count })}</Text></View>
      </View>
      {waiting ? <View style={s.warn}><Icon name="clock" size={15} color="#FFD36B" /><Text variant="small" weight="bold" tone="white">{t("rtx.waiting", { n: waiting })}</Text></View> : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.rl, gap: 12, marginBottom: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  stars: { alignItems: "flex-end", gap: 4 },
  soft: { opacity: 0.85 },
  warn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: "rgba(255,190,60,0.28)" },
});
