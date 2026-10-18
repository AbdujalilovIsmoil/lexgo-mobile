import { View } from "react-native";
import { ServiceList, useServiceSearch, type Service } from "@/entities/service";
import { Pill, SheetBack, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { PrepCard } from "./PrepTypes";

// Ready templates for the chosen document type (live search by its keyword).
export function PrepResults({ keyword, card, onBack, onPick }: { keyword: string; card: PrepCard; onBack: () => void; onPick: (s: Service) => void }) {
  const { t } = useT();
  const { data, isFetching } = useServiceSearch(keyword);
  return (
    <View style={{ gap: 12 }}>
      <SheetBack onPress={onBack} />
      <Text variant="h3">{card.title}</Text>
      <Text variant="small" tone="gray">{card.text}</Text>
      <Pill label={`${card.price} ${card.unit}`} tone="blue" />
      <Text variant="h4">{t("modes.ui.templates")}</Text>
      <ServiceList services={data} loading={isFetching && !data} onPick={onPick} />
    </View>
  );
}
