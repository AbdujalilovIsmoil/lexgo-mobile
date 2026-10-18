import { useState } from "react";
import { View } from "react-native";
import { ServiceList, useServiceSearch, type DetailRenderer, type Service } from "@/entities/service";
import { SheetBack, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ConsultCard } from "./ConsultOptions";

type Props = { card?: ConsultCard; onBack: () => void; navigate: (fn: () => void) => void; renderDetail: DetailRenderer };

// Real consultation services (live search); a tapped one opens its order flow.
export function ConsultResults({ card, onBack, navigate, renderDetail }: Props) {
  const { t } = useT();
  const { data, isFetching } = useServiceSearch("konsultatsiya");
  const [service, setService] = useState<Service | null>(null);
  if (service) return <>{renderDetail(service, () => setService(null), navigate)}</>;
  return (
    <View style={{ gap: 12 }}>
      <SheetBack onPress={onBack} />
      {card ? <Text variant="h3">{card.title}</Text> : null}
      <Text variant="h4">{t("topics.services")}</Text>
      <ServiceList services={data} loading={isFetching && !data} onPick={setService} />
    </View>
  );
}
