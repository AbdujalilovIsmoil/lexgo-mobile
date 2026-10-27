import { View } from "react-native";
import { EmptyState, PressableScale, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useSellerPromos, type LawyerService } from "@/entities/lawyer";
import { SafeDeal } from "@/widgets/lawyer-sheet";
import { ServiceOption } from "./ServiceOption";

type Props = { sellerId: string; services: LawyerService[]; selected: string; blocked: string; onSelect: (id: string) => void; onExplain: () => void };

// "Xizmatlar va narxlar": the price explainer link, the lead, the radio list of services, why a purchase is closed (if it
// is) and the backend's guarantees of the picked service (one request for the picked one, not one per row).
export function ServicesPanel({ sellerId, services, selected, blocked, onSelect, onExplain }: Props) {
  const { t } = useT();
  const c = useColors();
  // A service is «Tavsiya etilgan» when the server flags it or one of his running service boosts (GET /promotions/active?seller_user_id)
  // names it; those come first.
  const boosted = new Set((useSellerPromos(sellerId).data ?? []).filter((p) => p.placement === "service_boost" && p.serviceId).map((p) => p.serviceId));
  const list = services.map((sv) => ({ ...sv, sponsored: sv.sponsored || boosted.has(sv.id) })).sort((a, b) => Number(b.sponsored) - Number(a.sponsored));
  return (
    <View style={{ gap: 14 }}>
      <ProfileSection accent="gold" icon="briefcase" title={t("mkd.services")}>
        <PressableScale onPress={onExplain} accessibilityRole="button" style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: c.surface2 }}>
          <Text variant="small" weight="bold" tone="accent">{t("mkd.priceHow")}</Text>
        </PressableScale>
        <Text variant="small" tone="gray">{t("mkd.servicesLead")}</Text>
        {list.length ? (
          <View style={{ gap: 10 }}>{list.map((sv) => <ServiceOption key={sv.id} service={sv} selected={sv.id === selected} onSelect={() => onSelect(sv.id)} />)}</View>
        ) : <EmptyState compact icon="briefcase" title={t("mkd.noServices")} />}
        {blocked ? <Text variant="small" tone="warn">{blocked}</Text> : null}
      </ProfileSection>
      <SafeDeal serviceId={selected} />
    </View>
  );
}
