import { Fragment, useMemo, useState, type ReactElement } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useJobs } from "@/entities/market-feed";
import { useRequests, type ReqItem } from "@/entities/pro-requests";
import { statusLabel } from "@/entities/pro-requests/lib/label";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { radius, useColors } from "@/shared/theme";
import { Button, EmptyState, ErrorView, Icon, Pill, PressableScale, Skeleton, Text, type PillTone } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";

type Tab = "new" | "orders" | "urgent" | "docs";
const TABS: { key: Tab; label: string; empty: string; route: string }[] = [
  { key: "new", label: "aw2.inbox.newOrders", empty: "aw2.inbox.newEmpty", route: "/pro/market" },
  { key: "orders", label: "lsb.marketplaceOrders", empty: "aw2.empty.orders", route: "/pro/orders" },
  { key: "urgent", label: "lsb.urgentAssigned", empty: "aw2.empty.urgent", route: "/pro/urgent" },
  { key: "docs", label: "lsb.documentRequests", empty: "aw2.empty.docs", route: "/pro/docs" },
];
const OVER = new Set(["expired", "overdue"]);
const STEP = 25;
type Row = { key: string; ref: string; title: string; sub: string; pill: { label: string; tone: PillTone }; route: string };

// The advokat's So'rovlar, as the web portal's "orders" group: new orders (open orders to accept), service orders, Tezkor work and
// document requests — one tab each with its count, the chosen one's open items below (what waits for an answer first), and the way
// into that section's full page (history, filters, accept / decline). Nothing else: no meetings, no summary tiles.
export function AdvocateRequests({ bottomPad }: { bottomPad: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const jobs = useJobs();
  const q = { orders: useRequests("orders"), urgent: useRequests("urgent"), docs: useRequests("docs") };
  const [tab, setTab] = useState<Tab>("new");
  const [limit, setLimit] = useState(STEP);
  const [now] = useState(Date.now);
  const pull = usePullRefresh(() => Promise.all([jobs.refetch(), ...Object.values(q).map((x) => x.refetch())]));

  const overdue = (x: ReqItem) => OVER.has(x.status) || (x.active && !!x.due && Date.parse(x.due) < now);
  const rank = (x: ReqItem) => (x.action && !overdue(x) ? 0 : overdue(x) ? 1 : 2);
  const open = (k: Exclude<Tab, "new">) => (q[k].data ?? []).filter((x) => x.active || overdue(x)).sort((a, b) => rank(a) - rank(b) || b.at.localeCompare(a.at));
  const lists = useMemo(
    () => ({ orders: open("orders"), urgent: open("urgent"), docs: open("docs") }),
    [q.orders.data, q.urgent.data, q.docs.data], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const count = (k: Tab) => (k === "new" ? jobs.data?.length ?? 0 : lists[k].length);

  const rows: Row[] =
    tab === "new"
      ? (jobs.data ?? []).map((j) => ({
          key: `new-${j.id}`,
          ref: j.workId,
          title: j.serviceName || j.title || t("aw2.untitled.orders"),
          sub: [j.region, j.amount ? `${fmtMoney(j.amount)} ${t("common.currency")}` : ""].filter(Boolean).join(" · "),
          pill: { label: t("aw2.inbox.needs"), tone: "warn" },
          route: `/pro/orders/${encodeURIComponent(j.id)}`,
        }))
      : lists[tab].map((x) => ({
          key: `${x.kind}-${x.id}`,
          ref: x.ref,
          title: x.title || t(`aw2.untitled.${x.kind}`),
          sub: x.client,
          pill: overdue(x)
            ? { label: t("aw2.inbox.overdue"), tone: "err" }
            : x.action
              ? { label: statusLabel(t, x.status) || t("aw2.inbox.needs"), tone: "warn" }
              : { label: statusLabel(t, x.status), tone: "blue" },
          route: x.route,
        }));

  const src = tab === "new" ? jobs : q[tab];
  const current = TABS.find((x) => x.key === tab)!;
  let body: ReactElement;
  if (src.isLoading && !rows.length) body = <View style={s.gap}>{[0, 1, 2].map((i) => <Skeleton key={i} height={84} round={18} />)}</View>;
  else if (src.isError && !rows.length) body = <ErrorView error={src.error} onRetry={() => void src.refetch()} />;
  else if (!rows.length) body = <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}><EmptyState compact icon="inbox" title={t(current.empty)} text={t("aw2.emptyText")} /></View>;
  else body = (
    <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      {rows.slice(0, limit).map((x, k) => (
        <Fragment key={x.key}>
          {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
          <PressableScale onPress={() => router.push(x.route as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${x.title}, ${x.pill.label}`} style={s.row}>
            <View style={s.rowTx}>
              <View style={s.top}>
                <Text variant="caption" weight="bold" tone="accent" numberOfLines={1} style={s.ref}>{x.ref || t(current.label)}</Text>
                {x.pill.label ? <Pill label={x.pill.label} tone={x.pill.tone} small /> : null}
              </View>
              <Text variant="body" weight="bold" numberOfLines={2}>{x.title}</Text>
              {x.sub ? <Text variant="small" tone="gray" numberOfLines={1}>{x.sub}</Text> : null}
            </View>
            <Icon name="chevron-right" size={18} color={c.gray} />
          </PressableScale>
        </Fragment>
      ))}
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.page, { paddingBottom: bottomPad }]} refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} tintColor={c.accent} colors={[c.accent]} />}>
      <View style={s.chips}>
        <ChipBar
          value={tab}
          onChange={(v) => { setTab(v); setLimit(STEP); }}
          options={TABS.map((x) => ({ value: x.key, label: t(x.label), count: count(x.key) }))}
        />
      </View>
      {body}
      {rows.length > limit ? <Button title={t("adm.loadMore")} variant="soft" full onPress={() => setLimit((n) => n + STEP)} /> : null}
      {/* Hozircha kerak emas: tanlangan bo'limning to'liq sahifasini ochadigan "Barchasini ochish" tugmasi.
      <Button title={t("aw2.inbox.openAll")} variant="soft" icon="arrow-right" iconRight full onPress={() => router.push(current.route as never)} />
      */}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 14 },
  gap: { gap: 10 },
  chips: { marginHorizontal: -16 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  rowTx: { flex: 1, minWidth: 0, gap: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  ref: { flex: 1 },
});
