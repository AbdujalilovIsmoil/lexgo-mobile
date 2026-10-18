import { View } from "react-native";
import { EventRow, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";

// "Upcoming" block under the month grid: the next few events with their dates.
export function Upcoming({ events, onOpen }: { events: CalEvent[]; onOpen: (e: CalEvent) => void }) {
  const { t } = useT();
  if (!events.length) return null;
  return (
    <View style={{ gap: 8 }}>
      <Text variant="h4">{t("aw6.upcoming")}</Text>
      {events.map((e) => <EventRow key={e.id} event={e} withDate onPress={() => onOpen(e)} />)}
    </View>
  );
}
