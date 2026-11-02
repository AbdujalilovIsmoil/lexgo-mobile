import { Fragment, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useClientDetail, type ClientDetail, type Linked } from "@/entities/pro-clients";
import { useRequests } from "@/entities/pro-requests";
import { statusLabel } from "@/entities/pro-requests/lib/label";
import { useClientCall } from "@/features/pro-client-call/useClientCall";
import { CaseFormSheet } from "@/features/pro-case-form";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { formatAnyPhone } from "@/shared/lib/phone";
import { openTel } from "@/shared/lib/links";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows, useColors } from "@/shared/theme";
import { Avatar, BottomSheet, EmptyState, ErrorView, Icon, PressableScale, Skeleton, Text, type IconName } from "@/shared/ui";
import { AdminPage, ChipBar, StatusPill } from "@/shared/ui/admin";
import { ContactCard, LinkedList } from "@/widgets/pro-client-sheet";

const DONE = new Set(["completed", "archived", "closed", "cancelled", "canceled", "done", "rated", "refunded", "declined"]);
type Tab = "timeline" | "payments" | "documents" | "orders";
const HISTORY: Tab[] = ["timeline", "documents", "orders", "payments"];
type Work = Linked & { kind: "case" | "order" | "doc"; to: string };
// A document of the client that is not one of this professional's document requests (the client's own draft, or one sent to someone
// else): the backend lists it on the card but does not open it to them (404), so a tap shows what the card knows instead.
type DocInfo = Linked;

// /pro/clients/[id] — the client card: who they are on a navy card (phone · region, active cases, secure chat), the three things done from
// here (secure chat, a call — audio or video in the app, or the phone — and a new case for this client), their work (cases, orders, document
// requests, open ones first), the contact details, then the history and documents behind one row. Everything is GET /lawyers/me/clients/{id}.
export function ClientCardPage() {
  const { t } = useT();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const q = useClientDetail(id);
  const d = q.data;
  return (
    <AdminPage title={d?.name || t("aw3.card")} subtitle={d?.name ? t("aw3.card") : undefined}>
      {q.isLoading ? (
        <View style={s.body}><Skeleton height={150} round={22} /><Skeleton height={110} round={20} /><Skeleton height={180} round={20} /></View>
      ) : q.isError ? (
        <View style={s.body}>{q.error instanceof ApiError && q.error.status === 404 ? <EmptyState icon="users" title={t("aw3.notFound")} /> : <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />}</View>
      ) : d ? <Card d={d} /> : null}
    </AdminPage>
  );
}

function Card({ d }: { d: ClientDetail }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const insets = useInsets();
  const comm = useClientCall(d);
  const [calling, setCalling] = useState(false);
  const [newCase, setNewCase] = useState(false);
  const [history, setHistory] = useState(false);
  const [tab, setTab] = useState<Tab>("timeline");
  const [info, setInfo] = useState<DocInfo | null>(null);
  const mine = new Set((useRequests("docs").data ?? []).map((x) => x.id));
  const openDoc = (x: Linked) => (mine.has(x.id) ? router.push(`/pro/docs/${x.id}` as never) : setInfo(x));
  const active = d.cases.filter((x) => !DONE.has(x.status));
  const works: Work[] = [
    ...d.cases.map((x): Work => ({ ...x, kind: "case", to: `/pro/cases/${x.id}` })),
    ...d.orders.map((x): Work => ({ ...x, kind: "order", to: `/pro/orders/${x.id}` })),
    ...d.documents.map((x): Work => ({ ...x, kind: "doc", to: `/pro/docs/${x.id}` })),
  ].sort((a, b) => Number(DONE.has(a.status)) - Number(DONE.has(b.status)) || b.at.localeCompare(a.at));
  const sub = [d.phone ? formatAnyPhone(d.phone) : "", d.region].filter(Boolean).join(" · ");
  const chips = [active.length ? t("aw3.page.activeN", { n: active.length }) : "", d.chats.length ? t("aw3.chat") : "", d.manual ? t("aw3.manual") : ""].filter(Boolean);
  const tiles: { key: string; icon: IconName; label: string; on: () => void; busy?: boolean; off?: boolean }[] = [
    { key: "chat", icon: "message-circle", label: t("aw3.chat"), on: comm.chat, busy: comm.busy === "chat", off: !comm.inApp },
    { key: "call", icon: "phone", label: t("aw3.callPhone"), on: () => setCalling(true), busy: comm.busy === "audio" || comm.busy === "video", off: !comm.inApp && !d.phone },
    { key: "case", icon: "briefcase", label: t("aw3.page.newCase"), on: () => setNewCase(true) },
  ];
  const kindLabel = { case: t("aw3.page.case"), order: t("aw3.page.order"), doc: t("aw3.page.doc") };
  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]}>
        <LinearGradient colors={["#0E2457", "#173A86", "#2456C2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, shadows.blue]}>
          <View style={s.glow} pointerEvents="none" />
          <View style={s.heroRow}>
            <View style={s.ring}><Avatar name={d.name || "?"} size={60} /></View>
            <View style={s.who}>
              <Text variant="h2" tone="white" numberOfLines={2}>{d.name}</Text>
              {sub ? <Text variant="small" numberOfLines={1} style={s.heroSub}>{sub}</Text> : null}
            </View>
          </View>
          {chips.length ? <View style={s.chips}>{chips.map((x) => <View key={x} style={s.chip}><Text variant="caption" weight="bold" tone="white">{x}</Text></View>)}</View> : null}
          {d.createdAt ? <Text variant="caption" style={s.since}>{t("aw3.since", { date: fmtDate(d.createdAt, locale) })}</Text> : null}
        </LinearGradient>

        <View style={s.tiles}>
          {tiles.map((x) => (
            <PressableScale key={x.key} onPress={x.on} disabled={x.off || x.busy} accessibilityRole="button" accessibilityLabel={x.label} accessibilityState={{ disabled: !!x.off }} style={[s.tile, shadows.s1, { backgroundColor: c.glassFill, borderColor: c.glassLine, opacity: x.off ? 0.45 : 1 }]}>
              <View style={[s.tIco, { backgroundColor: c.tint2 }]}>{x.busy ? <ActivityIndicator size="small" color={c.accent} /> : <Icon name={x.icon} size={20} color={c.accent} />}</View>
              <Text variant="body" weight="bold" numberOfLines={2}>{x.label}</Text>
            </PressableScale>
          ))}
        </View>
        {d.manual && !d.chats.length ? <Text variant="caption" tone="gray" style={s.note}>{t("aw3.page.noAccount")}</Text> : null}

        <Text variant="caption" weight="bold" tone="gray" style={s.kick}>{t("aw3.page.works").toUpperCase()}</Text>
        <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          {works.length ? works.map((w, k) => (
            <Fragment key={`${w.kind}${w.id}`}>
              {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
              <PressableScale onPress={() => (w.kind === "doc" ? openDoc(w) : router.push(w.to as never))} scale={0.99} accessibilityRole="button" accessibilityLabel={`${w.title}, ${kindLabel[w.kind]}`} style={s.row}>
                <View style={s.rowTx}>
                  <View style={s.top}>
                    <Text variant="caption" weight="bold" tone="accent" numberOfLines={1} style={s.flex}>{w.ref || kindLabel[w.kind]}</Text>
                    {w.status ? <StatusPill status={w.status} label={statusLabel(t, w.status)} /> : null}
                  </View>
                  <Text variant="body" weight="bold" numberOfLines={2}>{w.title}</Text>
                  <Text variant="small" tone="gray" numberOfLines={1}>{[kindLabel[w.kind], w.ref ? w.sub.replace(w.ref, "").replace(/^ · | · $/g, "") : w.sub].filter(Boolean).join(" · ")}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={c.gray} />
              </PressableScale>
            </Fragment>
          )) : <View style={s.empty}><Text variant="small" tone="gray" center>{t("aw3.page.worksEmpty")}</Text></View>}
        </View>

        <ContactCard d={d} />

        <PressableScale onPress={() => setHistory((x) => !x)} scale={0.99} accessibilityRole="button" accessibilityState={{ expanded: history }} style={[s.histRow, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <Icon name="clock" size={20} color={c.accentStrong} />
          <Text variant="body" weight="bold" style={s.flex}>{t("aw3.history")}</Text>
          <Icon name={history ? "chevron-up" : "chevron-right"} size={18} color={c.gray} />
        </PressableScale>
        {history ? (
          <View style={s.hist}>
            <View style={s.histTabs}><ChipBar options={HISTORY.map((x) => ({ value: x, label: t(`aw3.tab.${x}`), count: d[x].length || undefined }))} value={tab} onChange={setTab} /></View>
            <LinkedList rows={d[tab]} icon={{ timeline: "clock", orders: "shopping-bag", payments: "credit-card", documents: "file-text" }[tab] as "clock"} onOpen={tab === "orders" ? (oid) => router.push(`/pro/orders/${oid}` as never) : tab === "documents" ? (did) => { const x = d.documents.find((y) => y.id === did); if (x) openDoc(x); } : undefined} />
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet visible={calling} onClose={() => setCalling(false)} title={t("aw3.page.callTitle")} subtitle={d.name} snaps={[0.44]}>
        <View style={s.sheet}>
          <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            {[
              comm.inApp ? { key: "audio", icon: "phone-call" as IconName, title: t("aw3.page.callAudio"), sub: t("aw3.page.callAudioSub"), on: () => comm.call("audio") } : null,
              comm.inApp ? { key: "video", icon: "video" as IconName, title: t("aw3.page.callVideo"), sub: t("aw3.page.callVideoSub"), on: () => comm.call("video") } : null,
              d.phone ? { key: "tel", icon: "phone" as IconName, title: t("aw3.page.callTel"), sub: formatAnyPhone(d.phone), on: () => openTel(d.phone) } : null,
            ].filter((x): x is NonNullable<typeof x> => !!x).map((x, k) => (
              <Fragment key={x.key}>
                {k ? <View style={[s.rule, { backgroundColor: c.line, marginLeft: 70 }]} /> : null}
                <PressableScale onPress={() => { setCalling(false); x.on(); }} scale={0.99} accessibilityRole="button" style={s.row}>
                  <View style={[s.tIco, { backgroundColor: c.tint2 }]}><Icon name={x.icon} size={20} color={c.accent} /></View>
                  <View style={s.rowTx}><Text variant="body" weight="bold">{x.title}</Text><Text variant="small" tone="gray">{x.sub}</Text></View>
                  <Icon name="chevron-right" size={18} color={c.gray} />
                </PressableScale>
              </Fragment>
            ))}
          </View>
        </View>
      </BottomSheet>
      <BottomSheet visible={!!info} onClose={() => setInfo(null)} title={t("aw3.page.docInfo")} subtitle={info?.ref || undefined} snaps={[0.5]}>
        {info ? (
          <View style={s.sheet}>
            <Text variant="h4">{info.title}</Text>
            <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              {[
                info.ref ? [t("aw3.page.number"), info.ref] : null,
                info.status ? [t("aw3.page.state"), statusLabel(t, info.status)] : null,
                info.at ? [t("aw3.page.updated"), fmtDate(info.at, locale)] : null,
              ].filter((x): x is string[] => !!x).map(([k, v], i) => (
                <Fragment key={k}>
                  {i ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
                  <View style={s.fact}><Text variant="small" tone="gray">{k}</Text><Text variant="body" weight="semibold" numberOfLines={1} style={s.factV}>{v}</Text></View>
                </Fragment>
              ))}
            </View>
            <View style={[s.lock, { backgroundColor: c.warnBg }]}>
              <Icon name="lock" size={17} color={c.warn} />
              <Text variant="small" style={[s.flex, { color: c.warn }]}>{t("aw3.page.docLocked")}</Text>
            </View>
          </View>
        ) : null}
      </BottomSheet>
      <CaseFormSheet visible={newCase} onClose={() => setNewCase(false)} item={null} clientId={d.manual ? undefined : d.id} />
    </>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 14 },
  flex: { flex: 1 },
  hero: { borderRadius: radius.rl, padding: 18, gap: 14, overflow: "hidden" },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.12)", right: -70, top: -90 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  ring: { padding: 3, borderRadius: 36, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  who: { flex: 1, minWidth: 0, gap: 3 },
  heroSub: { color: "#C9D8F5" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)" },
  since: { color: "rgba(255,255,255,0.7)" },
  tiles: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, minHeight: 128, padding: 14, borderRadius: radius.rl, borderWidth: 1, justifyContent: "space-between" },
  tIco: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  note: { marginTop: -4, paddingHorizontal: 4 },
  kick: { letterSpacing: 0.8, paddingHorizontal: 4, marginTop: 6 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowTx: { flex: 1, minWidth: 0, gap: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  empty: { padding: 20 },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderRadius: radius.rl, borderWidth: 1 },
  hist: { gap: 10 },
  histTabs: { marginHorizontal: -16 },
  sheet: { paddingHorizontal: 18, paddingBottom: 24, gap: 14 },
  fact: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  factV: { flex: 1, textAlign: "right" },
  lock: { flexDirection: "row", gap: 10, padding: 14, borderRadius: radius.r },
});
