import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BestMatchCard, Monogram, type MyMatch } from "@/entities/lawyer";
import { PressableScale, Text, Icon } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STACK = 4;

// The result of matching in one glance: only the best pick as a hero card; the rest are a stack of monograms with a
// "N more" line that opens the full ranking (/matches). Title: the new lead's pick, or "from your last analysis".
export function MatchPicks({ matches, title }: { matches: MyMatch[]; title: string }) {
  const { t } = useT();
  const router = useRouter();
  const [best, ...rest] = matches;
  if (!best) return null;
  const more = rest.length ? (
    <PressableScale onPress={() => router.push("/matches")} accessibilityRole="button" style={s.more}>
      <View style={s.stack}>{rest.slice(0, STACK).map((m, i) => <View key={m.id || m.userId} style={[s.mono, i ? s.overlap : null]}><Monogram name={m.name || "A"} rating={m.rating} size={32} ring={false} /></View>)}</View>
      <Text variant="small" weight="bold" tone="white" numberOfLines={1} style={s.flex}>{t("mpx.more", { n: rest.length })}</Text>
      <Icon name="chevron-right" size={18} color="#FFFFFF" />
    </PressableScale>
  ) : null;
  return (
    <View style={s.col}>
      <Text variant="h4">{title}</Text>
      <BestMatchCard match={best} onPress={() => router.push({ pathname: "/specialist/[id]", params: { id: best.userId || best.id } })} footer={more} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  more: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 2 },
  stack: { flexDirection: "row" },
  mono: { borderRadius: 16, borderWidth: 2, borderColor: "#1668F0" },
  overlap: { marginLeft: -10 },
  flex: { flex: 1 },
});
