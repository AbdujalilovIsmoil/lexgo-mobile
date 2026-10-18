import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ClientRow, detailHref, useMine, useUrgentFlash } from "@/entities/urgent";
import { EmptyState, ErrorView, Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const PREVIEW = 3;

// "Mening so'rovlarim" on the page itself (the web lists them under the services): the newest few, the whole list is /urgent/requests.
export function MineSection() {
  const { t } = useT();
  const router = useRouter();
  const c = useColors();
  const q = useMine();
  const fresh = useUrgentFlash((f) => f.fresh);
  const rows = q.data ?? [];
  return (
    <View style={s.col}>
      <View style={s.head}>
        <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="clock" size={17} tone="accent" /></View>
        <Text variant="h4" style={s.flex}>{t("ug1.mine")}</Text>
        {rows.length ? <View style={[s.count, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent">{rows.length}</Text></View> : null}
        {rows.length > PREVIEW ? <PressableScale onPress={() => router.push("/urgent/requests")} hitSlop={8}><Text variant="small" weight="semibold" tone="accent">{t("cdash.viewAll")}</Text></PressableScale> : null}
      </View>
      {q.isLoading ? <Skeleton height={120} round={20} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
        : !rows.length ? <EmptyState icon="zap" title={t("ug1.mineEmpty")} text={t("ug1.mineEmptyText")} compact />
        : rows.slice(0, PREVIEW).map((r) => <ClientRow key={r.id} item={r} fresh={r.id === fresh} onPress={() => router.push(detailHref("client", r.id))} />)}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, marginTop: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  count: { minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
