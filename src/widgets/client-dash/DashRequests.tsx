import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { orderPhase, type MarketOrder } from "@/entities/order";
import { Avatar, EmptyState, ErrorView, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useActiveWorks, workStage, workStep } from "./useActiveWorks";

const MAX = 8;
const CARD_W = 236;

// "Faol ishlar" (Adliya .j-cases), the web dashboard's "Jarayondagi ishlar": the client's unfinished marketplace orders as cards in a row that
// scrolls sideways — the status tag and the step (2/4) on top, the service, the number in monospace, four step bars, then the specialist.
// A tap opens the order. A single work fills the width (no row, no "Barchasi"); "Barchasi" (the orders tab) shows from two works on.
export function DashRequests() {
  const { t } = useT();
  const router = useRouter();
  const w = useActiveWorks();
  const rows = w.active.slice(0, MAX);
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4" style={s.h}>{t("cdash.home.works.title")}</Text>
        {rows.length > 1 ? (
          <PressableScale onPress={() => router.navigate("/(tabs)/orders")} hitSlop={8}>
            <Text variant="small" weight="bold" tone="accent">{t("cdash.home.all")}</Text>
          </PressableScale>
        ) : null}
      </View>
      {w.loading ? (
        <View style={s.pad}><Skeleton height={150} round={18} /></View>
      ) : w.error && !rows.length ? (
        <View style={s.pad}><ErrorView error={w.error} onRetry={w.refetch} compact /></View>
      ) : !rows.length ? (
        <View style={s.pad}>
          <EmptyState icon="briefcase" title={t("cdash.home.works.empty")} text={t("cdash.home.works.emptyText")} actionLabel={t("cdash.home.works.emptyCta")} onAction={() => router.navigate("/(tabs)/lawyers")} compact />
        </View>
      ) : rows.length === 1 ? (
        <View style={s.pad}><WorkCard o={rows[0]} full onPress={() => router.push({ pathname: "/orders/[id]", params: { id: rows[0].id } })} /></View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} decelerationRate="fast" snapToInterval={CARD_W + 10} snapToAlignment="start">
          {rows.map((o) => <WorkCard key={o.id} o={o} onPress={() => router.push({ pathname: "/orders/[id]", params: { id: o.id } })} />)}
        </ScrollView>
      )}
    </View>
  );
}

// `full`: the only card — it takes the whole width instead of peeking out of a row.
function WorkCard({ o, full, onPress }: { o: MarketOrder; full?: boolean; onPress: () => void }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const stage = workStage(o);
  const step = workStep(o);
  const tone = stage === "payment" ? { bg: c.warnBg, fg: c.warn } : stage === "done" ? { bg: c.okBg, fg: c.ok } : { bg: c.tint2, fg: c.accent };
  const status = t(`mf.phase.${orderPhase(o)}`);
  const title = o.serviceTitle || o.workId || "—";
  const who = o.lawyerName.trim();
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={`${title}, ${status}, ${t("cdash.home.works.step", { n: step })}`} style={[s.card, full && s.full, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.top}>
        <View style={[s.tag, { backgroundColor: tone.bg }]}><Text variant="caption" weight="bold" numberOfLines={1} style={[s.tagTx, { color: tone.fg }]}>{status}</Text></View>
        <Text variant="caption" weight="bold" tone="accent" style={s.step}>{t("cdash.home.works.step", { n: step })}</Text>
      </View>
      <Text variant="h4" numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.title}>{title}</Text>
      {o.workId ? <Text variant="caption" tone="gray" numberOfLines={1} style={s.mono}>{o.workId}</Text> : null}
      <View style={s.bars}>
        {[1, 2, 3, 4].map((n) => <View key={n} style={[s.bar, { backgroundColor: n <= step ? (stage === "payment" ? c.warn : stage === "done" ? c.ok : c.accent) : c.line }]} />)}
      </View>
      <View style={s.foot}>
        {who ? <Avatar name={who} size={26} /> : null}
        <Text variant="caption" weight="semibold" tone="gray" numberOfLines={1} style={s.flex}>{who || t("cdash.home.works.waiting")}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 10, minHeight: 22 },
  h: { fontSize: 17, lineHeight: 22 },
  pad: { paddingHorizontal: 16 },
  row: { paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  full: { width: "100%" },
  card: { width: CARD_W, borderRadius: 18, borderWidth: 1, padding: 14, gap: 6 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  tag: { flexShrink: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  tagTx: { fontSize: 11.5 },
  step: { fontSize: 12 },
  title: { fontSize: 14.5, lineHeight: 19, marginTop: 4 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 11 },
  bars: { flexDirection: "row", gap: 4, marginTop: 4 },
  bar: { flex: 1, height: 5, borderRadius: 5 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  flex: { flex: 1 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
});
