import { StyleSheet, View } from "react-native";
import { buildTimeline, orderPhase, useStatusHistory, type MarketOrder, type TimelineItem } from "@/entities/order";
import { phaseClosed, useFlowTimeline } from "@/entities/market-flow";
import { eventFailed, eventText } from "@/widgets/market-order";
import { useColors } from "@/shared/theme";
import { Icon, SectionHeader, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";

// What happened, oldest first: the order's unified timeline (GET …/timeline — steps, the call center's offer and choice, cancellation
// reviews, reassignments, refunds); without one, the status history or the steps read from the order. A reassignment the timeline does
// not list comes from the order's reassignment_history.
export function OrderTimeline({ order }: { order: MarketOrder }) {
  const c = useColors();
  const { t, locale } = useT();
  const flow = useFlowTimeline(order.id);
  const unified = flow.data ?? [];
  const { data } = useStatusHistory(order.id, flow.isFetched && !unified.length);
  const status = (s: string) => (t(`mk6.status.${s}`) !== `mk6.status.${s}` ? t(`mk6.status.${s}`) : humanizeSlug(s));
  const open = !phaseClosed(orderPhase(order));
  const own: TimelineItem[] = unified.length
    ? unified.map((e, i) => {
      const w = eventText(e, t, status);
      return { key: e.id || `${e.at}-${i}`, label: w.title, at: e.at, note: w.note || undefined, state: eventFailed(e) ? "fail" : open && i === unified.length - 1 ? "now" : "done" };
    })
    : buildTimeline(order, data ?? [], { status, step: (k) => t(`mk5.tl.${k}`) });
  const moved = unified.some((e) => e.type === "reassignment") ? [] : order.reassignments.map((r, i): TimelineItem => ({ key: `re-${i}`, label: t("mf.tl.reassignment"), at: r.at, note: r.reason ? t("mf.tl.reason", { reason: r.reason }) : undefined, state: "done" }));
  const items = moved.length ? [...own, ...moved].sort((a, b) => (!a.at ? 1 : !b.at ? -1 : a.at < b.at ? -1 : 1)) : own;
  return (
    <View style={s.col}>
      <SectionHeader title={t("mk4.history")} />
      {items.map((it, i) => {
        const tone = it.state === "fail" ? c.err : it.state === "now" ? c.accent : c.ok;
        return (
          <View key={it.key} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, { backgroundColor: tone }]}><Icon name={it.state === "fail" ? "x" : it.state === "now" ? "clock" : "check"} size={12} color="#fff" /></View>
              {i < items.length - 1 ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
            </View>
            <View style={s.txt}>
              <Text variant="small" weight="bold">{it.label}</Text>
              {it.at ? <Text variant="caption" tone="gray2">{fmtDateTime(it.at, locale)}</Text> : null}
              {it.note ? <Text variant="caption" tone="gray">{it.note}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 22 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  line: { flex: 1, width: 2, marginVertical: 3 },
  txt: { flex: 1, gap: 1, paddingBottom: 14 },
});
