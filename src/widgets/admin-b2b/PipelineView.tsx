import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { STAGES, stageColor, stageLabel, usePipeline, type PipelineItem } from "@/entities/admin-b2b";
import { Card, EmptyState, ErrorView, PressableScale, Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The B2B sales pipeline (GET /b2b/pipeline) as a board: one column per stage (colour, count, total value) you swipe through;
// tap a client card for its history.
export function PipelineView({ onOpen }: { onOpen: (i: PipelineItem) => void }) {
  const { t } = useT();
  const c = useColors();
  const { width } = useWindowDimensions();
  const q = usePipeline();
  const rank = (k: string) => (STAGES.includes(k) ? STAGES.indexOf(k) : STAGES.length);
  const stages = (q.data ?? []).filter((s) => s.count > 0).sort((a, b) => rank(a.stage) - rank(b.stage)); // funnel order, not the server's
  const w = Math.round(width * 0.78);
  if (q.isLoading) return <View style={s.pad}><Skeleton height={220} round={22} /></View>;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  if (!stages.length) return <EmptyState icon="trending-up" title={t("admB2bB.noPipeline")} />;
  return (
    <ScrollView horizontal snapToInterval={w + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}>
      {stages.map((st) => (
        <ScrollView key={st.stage} style={[s.col, { width: w, backgroundColor: c.surface2, borderColor: c.line }]} contentContainerStyle={s.colBody} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={s.head}>
            <View style={[s.dot, { backgroundColor: stageColor(st.stage) }]} />
            <Text variant="body" weight="bold" numberOfLines={1} style={s.fill}>{stageLabel(t, st.stage)}</Text>
            <Text variant="caption" weight="bold">{st.count}</Text>
          </View>
          {st.value ? <Text variant="caption" tone="gray">{fmtMoney(st.value)} {t("adm.currency")}</Text> : null}
          {st.items.map((i) => (
            <PressableScale key={i.id} onPress={() => onOpen(i)} scale={0.97} accessibilityRole="button">
              <Card style={s.card}>
                <Text variant="body" weight="bold" numberOfLines={1}>{i.name}</Text>
                {[i.industry, i.contact].filter(Boolean).length ? <Text variant="caption" tone="gray" numberOfLines={1}>{[i.industry, i.contact].filter(Boolean).join(" · ")}</Text> : null}
                {i.value ? <Text variant="small" weight="bold" tone="accent">{fmtMoney(i.value)} {t("adm.currency")}</Text> : null}
              </Card>
            </PressableScale>
          ))}
        </ScrollView>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: 16 },
  row: { paddingHorizontal: 16, gap: 12, alignItems: "flex-start", paddingBottom: 120 },
  col: { borderRadius: 22, borderWidth: 1.5, maxHeight: 560 },
  colBody: { padding: 10, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  fill: { flex: 1 },
  card: { padding: 12, gap: 3 },
});
