import { StyleSheet, View } from "react-native";
import { EmptyState, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSellerPromos, type LawyerService } from "@/entities/lawyer";
import { SafeDeal } from "@/widgets/lawyer-sheet";
import { ServiceOption } from "./ServiceOption";

type Props = { sellerId: string; services: LawyerService[]; selected: string; blocked: string; onSelect: (id: string) => void; onExplain: () => void };

// "Xizmatlar va narxlar": the price explainer link, the lead, the radio list of services, why a purchase is closed (if it
// is) and the backend's guarantees of the picked service (one request for the picked one, not one per row).
export function ServicesPanel({ sellerId, services, selected, blocked, onSelect, onExplain }: Props) {
  const { t } = useT();
  // A service is «Tavsiya etilgan» when the server flags it or one of his running service boosts (GET /promotions/active?seller_user_id)
  // names it; those come first.
  const boosted = new Set((useSellerPromos(sellerId).data ?? []).filter((p) => p.placement === "service_boost" && p.serviceId).map((p) => p.serviceId));
  const list = services.map((sv) => ({ ...sv, sponsored: sv.sponsored || boosted.has(sv.id) })).sort((a, b) => Number(b.sponsored) - Number(a.sponsored));
  return (
    <View style={{ gap: 14 }}>
      <View style={s.sec}>
        <View style={s.head}>
          <Text variant="h4" numberOfLines={2} style={s.h}>{t("mkd.services")}</Text>
          <PressableScale onPress={onExplain} hitSlop={8} accessibilityRole="button">
            <Text variant="small" weight="bold" tone="accent" style={s.link}>{t("mkd.priceHow")}</Text>
          </PressableScale>
        </View>
        <Text variant="small" tone="gray" style={s.lead}>{t("mkd.servicesLead")}</Text>
        {list.length ? (
          <View style={s.list}>{list.map((sv) => <ServiceOption key={sv.id} service={sv} selected={sv.id === selected} onSelect={() => onSelect(sv.id)} />)}</View>
        ) : <EmptyState compact icon="briefcase" title={t("mkd.noServices")} />}
        {blocked ? <Text variant="small" tone="warn">{blocked}</Text> : null}
      </View>
      <SafeDeal serviceId={selected} />
    </View>
  );
}

const s = StyleSheet.create({
  sec: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  h: { flex: 1, fontSize: 18, lineHeight: 24 },
  link: { fontSize: 14 },
  lead: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  list: { gap: 10 },
});
