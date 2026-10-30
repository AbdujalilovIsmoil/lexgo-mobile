import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { detailHref, isFinal, useMine, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useOpenCases } from "@/entities/open-cases";
import { EmptyState, Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { RequestRow } from "./RequestRow";
import { cardShadow } from "./DashTiles";

const URGENT_MAX = 2;
const CASES_MAX = 3;

// "Faol so'rovlar": the live urgent-advocate requests first (green, what happens next), then the open cases from GET /cases in one card.
// "Barchasi" opens the works tab.
export function DashRequests() {
  const { t } = useT();
  const router = useRouter();
  const cases = useOpenCases();
  const mine = useMine();
  const live = (mine.data ?? []).filter((r) => !isFinal(r)).slice(0, URGENT_MAX);
  const open = cases.open.slice(0, CASES_MAX);
  const loading = cases.isLoading && mine.isLoading;
  const { colors: c, dark } = useTheme();
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h3" style={{ fontSize: 19 }}>{t("cdash.home.active")}</Text>
        <PressableScale onPress={() => router.navigate("/(tabs)/works")} hitSlop={8}><Text variant="small" weight="bold" tone="accent" style={{ fontSize: 15 }}>{t("cdash.home.all")}</Text></PressableScale>
      </View>
      {loading ? <Skeleton height={72} round={20} /> : !live.length && !open.length ? (
        <EmptyState icon="star" title={t("cdash.emptyTitle")} text={t("cdash.emptyText")} compact />
      ) : (
        <>
          {live.map((r) => <UrgentLive key={r.id} r={r} onPress={() => router.push(detailHref("client", r.id))} />)}
          {open.length ? (
            <View style={[s.cases, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]}>
              {open.map((x, i) => <RequestRow key={x.id} c={x} last={i === open.length - 1} />)}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const headline = (status: string) =>
  status === "meeting_active" ? "ugLive" : status === "scheduled" ? "ugScheduled" : (status || "open_pool") === "open_pool" ? "ugSearching" : "ugComing";

function UrgentLive({ r, onPress }: { r: UrgentRequest; onPress: () => void }) {
  const { t } = useT();
  const { dark } = useTheme();
  const label = useUrgentLabels();
  const sub = [label.kind(r.serviceKind, r.serviceTitle), r.channel ? label.channel(r.channel) : ""].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" style={[s.live, dark ? s.liveDark : null]}>
      <View style={s.phone}><Icon name="phone" size={17} color="#FFFFFF" /></View>
      <View style={s.flex}>
        <Text variant="h4" numberOfLines={2} style={s.liveTitle}>{t(`cdash.home.${headline(r.status)}`)}</Text>
        {sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text> : null}
      </View>
      <View style={[s.pill, dark ? s.pillDark : null]}><Text variant="caption" weight="bold" style={s.green}>{label.status(r.status)}</Text></View>
    </PressableScale>
  );
}

const GREEN = "#2E8B4A";

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  cases: { borderRadius: 20, borderWidth: 1, ...cardShadow },
  live: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1, backgroundColor: "#E8F6EC", borderColor: "#CBE9D4", ...cardShadow },
  liveDark: { backgroundColor: "#12301F", borderColor: "#1E4A31" },
  phone: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#4CC26E", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "rgba(76,194,110,0.25)" },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  liveTitle: { color: GREEN, fontSize: 15, lineHeight: 19 },
  pill: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillDark: { backgroundColor: "rgba(255,255,255,0.08)" },
  green: { color: GREEN },
});
