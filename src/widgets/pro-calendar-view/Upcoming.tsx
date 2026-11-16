import { View } from "react-native";
import type { CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";
import { AgendaGroup } from "./AgendaGroup";

// "Upcoming" under the day's agenda: the next few events with their dates, as one white card.
export function Upcoming({ events, onOpen }: { events: CalEvent[]; onOpen: (e: CalEvent) => void }) {
  const { t } = useT();
  if (!events.length) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="small" weight="bold" tone="gray" style={{ letterSpacing: 0.8, marginLeft: 4 }}>{t("aw6.upcoming").toUpperCase()}</Text>
      <AgendaGroup events={events} onOpen={onOpen} withDate />
    </View>
  );
}
