import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { detailHref, isFinal, useMine, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useOpenCases, type OpenCase } from "@/entities/open-cases";
import { EmptyState, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { RequestRow, type ActiveRowData, type ChipTone } from "./RequestRow";
import { cardShadow } from "./DashTiles";

const URGENT_MAX = 2;
const CASES_MAX = 3;

const toneOf = (status: string): ChipTone => (/done|closed|complete|resolved/.test(status) ? "done" : /progress|review|wait|pending|pool|claim|schedul|meeting/.test(status) ? "busy" : "open");

const headline = (status: string) =>
  status === "meeting_active" ? "ugLive" : status === "scheduled" ? "ugScheduled" : (status || "open_pool") === "open_pool" ? "ugSearching" : "ugComing";

// "Faol so'rovlar": two cards of the same rows, kept apart — the live urgent-advocate requests, then the open cases from GET /cases.
// "Barchasi" opens the works tab.
export function DashRequests() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const label = useUrgentLabels();
  const cases = useOpenCases();
  const mine = useMine();
  const loading = cases.isLoading && mine.isLoading;
  const caseLabel = (v: string) => { const k = `cdash.st.${v}`; const x = t(k); return x === k ? v.replace(/[_-]+/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : x; };
  const urgentRow = (r: UrgentRequest): ActiveRowData => ({
    title: label.kind(r.serviceKind, r.serviceTitle),
    status: label.status(r.status),
    tone: toneOf(r.status || "open_pool"),
    id: r.workId || undefined,
    stage: t(`cdash.home.${headline(r.status)}`),
    next: r.nextAction || undefined,
    onPress: () => router.push(detailHref("client", r.id)),
  });
  const caseRow = (x: OpenCase): ActiveRowData => ({
    title: x.type || x.number,
    status: caseLabel(x.status),
    tone: toneOf(x.status),
    id: x.type && x.number ? x.number : undefined,
    stage: x.stage ? caseLabel(x.stage) : undefined,
    next: x.nextAction || undefined,
    onPress: () => router.push(`/works/${encodeURIComponent(x.number || x.id)}` as never),
  });
  const urgent = (mine.data ?? []).filter((r) => !isFinal(r)).slice(0, URGENT_MAX).map((r) => ({ key: r.id, row: urgentRow(r) }));
  const open = cases.open.slice(0, CASES_MAX).map((x) => ({ key: x.id, row: caseRow(x) }));
  const card = (rows: { key: string; row: ActiveRowData }[]) => (
    <View style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]}>
      {rows.map((x, i) => <RequestRow key={x.key} row={x.row} last={i === rows.length - 1} />)}
    </View>
  );
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h3" style={{ fontSize: 19 }}>{t("cdash.home.active")}</Text>
        <PressableScale onPress={() => router.navigate("/(tabs)/works")} hitSlop={8}><Text variant="small" weight="bold" tone="accent" style={{ fontSize: 15 }}>{t("cdash.home.all")}</Text></PressableScale>
      </View>
      {loading ? <Skeleton height={72} round={20} /> : !urgent.length && !open.length ? (
        <EmptyState icon="star" title={t("cdash.emptyTitle")} text={t("cdash.emptyText")} compact />
      ) : (
        <>
          {urgent.length ? card(urgent) : null}
          {open.length ? card(open) : null}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  card: { borderRadius: 20, borderWidth: 1, ...cardShadow },
});
