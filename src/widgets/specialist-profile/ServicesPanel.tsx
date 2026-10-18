import { View } from "react-native";
import { EmptyState, PressableScale, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { LawyerService } from "@/entities/lawyer";
import { SafeDeal } from "@/widgets/lawyer-sheet";
import { ServiceOption } from "@/widgets/specialist-profile";

type Props = { services: LawyerService[]; selected: string; blocked: string; onSelect: (id: string) => void; onExplain: () => void };

// "Xizmatlar va narxlar": the price explainer link, the lead, the radio list of services, why a purchase is closed (if it
// is) and the "Xavfsiz xarid" guarantees.
export function ServicesPanel({ services, selected, blocked, onSelect, onExplain }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ gap: 14 }}>
      <ProfileSection accent="gold" icon="briefcase" title={t("mkd.services")}>
        <PressableScale onPress={onExplain} accessibilityRole="button" style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: c.surface2 }}>
          <Text variant="small" weight="bold" tone="accent">{t("mkd.priceHow")}</Text>
        </PressableScale>
        <Text variant="small" tone="gray">{t("mkd.servicesLead")}</Text>
        {services.length ? (
          <View style={{ gap: 10 }}>{services.map((sv) => <ServiceOption key={sv.id} service={sv} selected={sv.id === selected} onSelect={() => onSelect(sv.id)} />)}</View>
        ) : <EmptyState compact icon="briefcase" title={t("mkd.noServices")} />}
        {blocked ? <Text variant="small" tone="warn">{blocked}</Text> : null}
      </ProfileSection>
      <SafeDeal />
    </View>
  );
}
