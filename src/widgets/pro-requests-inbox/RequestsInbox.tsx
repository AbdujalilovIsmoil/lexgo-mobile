import { Fragment, useMemo, useState, type ReactElement } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { REQ_KINDS, useRequestCounts, useRequests, type ReqItem, type ReqKind } from "@/entities/pro-requests";
import { statusLabel } from "@/entities/pro-requests/lib/label";
import { useT } from "@/shared/i18n";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { radius, useColors } from "@/shared/theme";
import { Button, EmptyState, ErrorView, Icon, Pill, PressableScale, Skeleton, Text, type IconName, type PillTone } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";

const MODULE: Record<ReqKind, { route: string; icon: IconName; title: string }> = {
  orders: { route: "/pro/orders", icon: "shopping-bag", title: "lsb.marketplaceOrders" },
  docs: { route: "/pro/docs", icon: "file-text", title: "lsb.documentRequests" },
  urgent: { route: "/pro/urgent", icon: "zap", title: "lsb.urgentAssigned" },
  meetings: { route: "/meetings", icon: "video", title: "lsb.meetings" },
};
const ORDER: ReqKind[] = ["orders", "docs", "urgent", "meetings"];
const OVER = new Set(["expired", "overdue"]);
const STEP = 25;
type Filter = "all" | "action" | "overdue" | ReqKind;

// So'rovlar: everything sent or assigned to the professional, from the four modules (marketplace orders, document requests, Tezkor,
// calls) in one place. On top the three numbers that decide the day — needs an action, overdue, total open — each a filter; then
// one chip per module with its count; then one grouped list, what waits for an answer first, then the overdue, then the newest — each row
// with its number, title, client · kind and status. Finished ones stay behind a toggle; the full module pages close the list.
export function RequestsInbox({ bottomPad }: { bottomPad: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  useRequestCounts(); // keeps the tab badge live
  const q = { orders: useRequests("orders"), docs: useRequests("docs"), urgent: useRequests("urgent"), meetings: useRequests("meetings") };
  const [filter, setFilter] = useState<Filter>("all");
  const [done, setDone] = useState(false);
  const [limit, setLimit] = useState(STEP);
  const [now] = useState(Date.now);
  const loading = Object.values(q).some((x) => x.isLoading);
  const failed = Object.values(q).find((x) => x.isError);
  const pull = usePullRefresh(() => Promise.all(Object.values(q).map((x) => x.refetch())));
  const all = useMemo(() => REQ_KINDS.flatMap((k) => q[k].data ?? []), [q.orders.data, q.docs.data, q.urgent.data, q.meetings.data]); // eslint-disable-line react-hooks/exhaustive-deps
  const overdue = (x: ReqItem) => OVER.has(x.status) || (x.active && !!x.due && Date.parse(x.due) < now);
  const open = all.filter((x) => x.active || overdue(x));
  const actionN = open.filter((x) => x.action && !overdue(x)).length;
  const overdueN = open.filter(overdue).length;
  const base = done ? all : open;
  const rank = (x: ReqItem) => (x.action && !overdue(x) ? 0 : overdue(x) ? 1 : x.active ? 2 : 3);
  const rows = base
    .filter((x) => (filter === "all" ? true : filter === "action" ? x.action && !overdue(x) : filter === "overdue" ? overdue(x) : x.kind === filter))
    .sort((a, b) => rank(a) - rank(b) || b.at.localeCompare(a.at));
  const pick = (f: Filter) => { setFilter(f); setLimit(STEP); };
  const stats: { key: Filter; n: number; label: string; color: string }[] = [
    { key: "action", n: actionN, label: t("aw2.inbox.action"), color: c.warn },
    { key: "overdue", n: overdueN, label: t("aw2.inbox.overdue"), color: c.err },
    { key: "all", n: open.length, label: t("aw2.inbox.total"), color: c.ink },
  ];
  const kindN = (k: ReqKind) => base.filter((x) => x.kind === k).length;
  const pill = (x: ReqItem): { label: string; tone: PillTone } =>
    overdue(x) ? { label: t("aw2.inbox.overdue"), tone: "err" }
    : x.action ? { label: statusLabel(t, x.status) || t("aw2.inbox.needs"), tone: "warn" }
    : !x.active ? { label: statusLabel(t, x.status), tone: "gray" }
    : { label: statusLabel(t, x.status), tone: "blue" };
  const modules = filter in MODULE ? [filter as ReqKind] : ORDER;
  let body: ReactElement;
  if (loading && !all.length) body = <View style={s.gap}>{[0, 1, 2].map((i) => <Skeleton key={i} height={84} round={18} />)}</View>;
  else if (failed && !all.length) body = <ErrorView error={failed.error} onRetry={() => void pull.onRefresh()} />;
  else if (!rows.length) body = <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}><EmptyState compact icon="inbox" title={filter in MODULE ? t(`aw2.empty.${filter}`) : t("aw2.inbox.empty")} text={t("aw2.emptyText")} /></View>;
  else body = (
    <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      {rows.slice(0, limit).map((x, k) => {
        const p = pill(x);
        return (
          <Fragment key={`${x.kind}-${x.id}`}>
            {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
            <PressableScale onPress={() => router.push(x.route as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${x.title || t(`aw2.untitled.${x.kind}`)}, ${p.label}`} style={s.row}>
              <View style={s.rowTx}>
                <View style={s.top}>
                  <Text variant="caption" weight="bold" tone="accent" numberOfLines={1} style={s.ref}>{x.ref || t(`aw2.inbox.kind.${x.kind}`)}</Text>
                  <Pill label={p.label} tone={p.tone} small />
                </View>
                <Text variant="body" weight="bold" numberOfLines={2}>{x.title || t(`aw2.untitled.${x.kind}`)}</Text>
                <Text variant="small" tone="gray" numberOfLines={1}>{[x.client, x.ref ? t(`aw2.inbox.kind.${x.kind}`) : ""].filter(Boolean).join(" · ")}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={c.gray} />
            </PressableScale>
          </Fragment>
        );
      })}
    </View>
  );
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.page, { paddingBottom: bottomPad }]} refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} tintColor={c.accent} colors={[c.accent]} />}>
      <View style={s.stats}>
        {stats.map((x) => (
          <PressableScale key={x.key} onPress={() => pick(filter === x.key && x.key !== "all" ? "all" : x.key)} scale={0.97} accessibilityRole="button" accessibilityState={{ selected: filter === x.key }} accessibilityLabel={`${x.label}: ${x.n}`}
            style={[s.stat, { backgroundColor: c.glassFill, borderColor: filter === x.key && x.key !== "all" ? x.color : c.glassLine }]}>
            <Text variant="h2" style={{ color: x.n || x.key === "all" ? x.color : c.gray }}>{loading && !all.length ? "—" : x.n}</Text>
            <Text variant="caption" weight="semibold" tone="gray" numberOfLines={1}>{x.label}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={s.chips}>
        <ChipBar value={filter} onChange={(v) => pick(v)} options={[{ value: "all" as Filter, label: t("aw2.inbox.all"), count: base.length }, ...ORDER.filter((k) => kindN(k) > 0 || filter === k).map((k) => ({ value: k as Filter, label: t(`aw2.inbox.kind.${k}`), count: kindN(k) }))]} />
      </View>
      {body}
      {rows.length > limit ? <Button title={t("adm.loadMore")} variant="soft" full onPress={() => setLimit((n) => n + STEP)} /> : null}
      <PressableScale onPress={() => setDone((v) => !v)} hitSlop={8} accessibilityRole="button" style={s.toggle}>
        <Icon name={done ? "eye-off" : "eye"} size={15} color={c.accent} />
        <Text variant="small" weight="semibold" tone="accent">{t(done ? "aw2.inbox.hideDone" : "aw2.inbox.showDone")}</Text>
      </PressableScale>
      <Text variant="caption" weight="bold" tone="gray" style={s.kick}>{t("aw2.inbox.modules").toUpperCase()}</Text>
      <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        {modules.map((k, i) => (
          <Fragment key={k}>
            {i ? <View style={[s.rule, { backgroundColor: c.line, marginLeft: 72 }]} /> : null}
            <PressableScale onPress={() => router.push(MODULE[k].route as never)} scale={0.99} accessibilityRole="button" style={s.row}>
              <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={MODULE[k].icon} size={19} color={c.accent} /></View>
              <View style={s.rowTx}>
                <Text variant="body" weight="bold" numberOfLines={1}>{t(MODULE[k].title)}</Text>
                <Text variant="small" tone="gray" numberOfLines={1}>{t("aw2.openAll")}</Text>
              </View>
              {q[k].data ? <Text variant="small" weight="bold" tone="gray">{(q[k].data ?? []).filter((x) => x.active).length}</Text> : null}
              <Icon name="chevron-right" size={18} color={c.gray} />
            </PressableScale>
          </Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 14 },
  gap: { gap: 10 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, borderRadius: radius.rl, borderWidth: 1.5, gap: 2 },
  chips: { marginHorizontal: -16 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  rowTx: { flex: 1, minWidth: 0, gap: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  ref: { flex: 1 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  kick: { letterSpacing: 0.8, paddingHorizontal: 4, marginTop: 4 },
});
