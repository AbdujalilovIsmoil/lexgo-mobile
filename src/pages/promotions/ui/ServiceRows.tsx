import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useProServices, type ProService } from "@/entities/pro-service";
import type { Running } from "@/entities/promotion";
import { Button, ErrorView, Icon, Pill, PressableScale, Skeleton, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Row = { id: string; name: string; sub: string; days: number };

// «Xizmatlarni targ'ib qilish»: the seller's active services as compact rows plus every boosted catalogue service that runs now (even one
// that is not in his own list); boosted ones wear «Targ'ibda · N kun». A tap opens the checkout for that service. Empty row only if both are empty.
export function ServiceRows({ running }: { running: Running[] }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const q = useProServices();
  const boosted = running.filter((r) => r.placement === "service_boost" && r.serviceId);
  const days = (id: string, own?: number) => Math.max(own ?? 0, ...boosted.filter((r) => r.serviceId === id).map((r) => r.daysLeft));
  const own: Row[] = (q.data?.items ?? []).filter((x: ProService) => x.status === "active").map((x: ProService) => ({ id: x.id, name: x.name, sub: x.categoryTitle, days: days(x.id, x.promotion?.daysLeft) }));
  const extra: Row[] = boosted.filter((r, i, all) => !own.some((o) => o.id === r.serviceId) && all.findIndex((x) => x.serviceId === r.serviceId) === i).map((r) => ({ id: r.serviceId, name: r.serviceTitle || r.packageTitle, sub: r.packageTitle, days: days(r.serviceId) }));
  const rows = [...extra, ...own].sort((a, b) => Number(b.days > 0) - Number(a.days > 0));
  const manage = () => router.push("/pro/services");
  return (
    <View style={s.box}>
      <Text variant="h4" accessibilityRole="header">{t("promoSeller.servicesTitle")}</Text>
      <Text variant="small" tone="gray">{t("promoSeller.servicesLead")}</Text>
      {q.isLoading && !rows.length ? (
        <Skeleton height={60} round={14} />
      ) : q.isError && !rows.length ? (
        <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
      ) : rows.length === 0 ? (
        <View style={[s.empty, { borderColor: c.line }]}>
          <Text variant="small" tone="gray" style={s.fill}>{t("promoSeller.servicesEmpty")}</Text>
          <Button title={t("promoSeller.servicesAdd")} variant="line" size="sm" onPress={manage} />
        </View>
      ) : (
        rows.map((x) => (
          <PressableScale
            key={x.id}
            onPress={() => router.push({ pathname: "/pro/promotions/new", params: { placement: "service_boost", service: x.id } })}
            disabled={x.days > 0}
            accessibilityRole="button"
            accessibilityLabel={x.days > 0 ? `${x.name}. ${t("promoSeller.ck.boosted", { d: x.days })}` : t("promoSeller.ck.promoteService", { name: x.name })}
            style={[s.row, { backgroundColor: x.days > 0 ? c.okBg : c.surface, borderColor: x.days > 0 ? c.ok : c.line }]}
          >
            <View style={s.fill}>
              <Text variant="body" weight="semibold" numberOfLines={2}>{x.name}</Text>
              {x.sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{x.sub}</Text> : null}
              {x.days > 0 ? <View style={s.badge}><Pill label={t("promoSeller.ck.boosted", { d: x.days })} tone="ok" icon="zap" small /></View> : null}
            </View>
            <Icon name={x.days > 0 ? "check-circle" : "chevron-right"} size={20} color={x.days > 0 ? c.ok : c.gray2} />
          </PressableScale>
        ))
      )}
      <PressableScale onPress={manage} accessibilityRole="link" style={s.manage}>
        <Text variant="small" weight="bold" tone="accent">{t("promoSeller.servicesManage")}</Text>
        <Icon name="arrow-right" size={16} tone="accent" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 10 },
  fill: { flex: 1, gap: 1 },
  badge: { alignSelf: "flex-start", marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1 },
  empty: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderStyle: "dashed", borderRadius: radius.r },
  manage: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, alignSelf: "flex-start" },
});
