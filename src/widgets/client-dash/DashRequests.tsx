import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { EmptyState, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { RequestCard } from "./RequestCard";
import { useActiveRequests } from "./useActiveRequests";

const URGENT_MAX = 2;
const CASES_MAX = 3;

// "Faol so'rovlar": two cards of the same rows, kept apart — the live urgent-advocate requests, then the open cases from GET /cases.
// "Barchasi" opens the whole list as a stack page over Home, with a back button (/dashboard-lists/works).
export function DashRequests() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c } = useTheme();
  const a = useActiveRequests();
  const urgent = a.urgent.slice(0, URGENT_MAX);
  const open = a.open.slice(0, CASES_MAX);
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h3" style={{ fontSize: 19 }}>{t("cdash.home.active")}</Text>
        <PressableScale onPress={() => router.push("/dashboard-lists/works" as never)} hitSlop={8} style={s.all}><Text variant="small" weight="regular" tone="accent" style={{ fontSize: 15 }}>{t("cdash.home.all")}</Text><ChevronRight size={18} color={c.accent} /></PressableScale>
      </View>
      {a.bothLoading ? <Skeleton height={72} round={20} /> : !urgent.length && !open.length ? (
        <EmptyState icon="star" title={t("cdash.emptyTitle")} text={t("cdash.emptyText")} compact />
      ) : (
        <>
          {urgent.length ? <RequestCard rows={urgent} /> : null}
          {open.length ? <RequestCard rows={open} /> : null}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  all: { flexDirection: "row", alignItems: "center", gap: 2 },
});
