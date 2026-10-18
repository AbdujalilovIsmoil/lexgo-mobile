import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { dayKey } from "@/shared/lib/pro/dates";
import { IconButton, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { DayAgenda } from "./DayAgenda";

const monday = (d: Date, weeks: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7) + weeks * 7);

// Seven-day agenda (Mon–Sun) with week stepping; days without events are skipped.
export function WeekView({ byDay, onOpen }: { byDay: Map<string, CalEvent[]>; onOpen: (e: CalEvent) => void }) {
  const { locale } = useT();
  const [offset, setOffset] = useState(0);
  const [today] = useState(() => new Date());
  const start = monday(today, offset);
  const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i).toISOString()));
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6).toISOString();
  return (
    <View style={{ gap: 14 }}>
      <View style={s.nav}>
        <IconButton icon="chevron-left" size={38} onPress={() => setOffset(offset - 1)} />
        <Text variant="h4" center style={{ flex: 1 }}>{`${fmtDate(start.toISOString(), locale)} – ${fmtDate(last, locale)}`}</Text>
        <IconButton icon="chevron-right" size={38} onPress={() => setOffset(offset + 1)} />
      </View>
      {days.map((d) => <DayAgenda key={d} day={d} events={byDay.get(d) ?? []} onOpen={onOpen} showEmpty={false} />)}
    </View>
  );
}

const s = StyleSheet.create({ nav: { flexDirection: "row", alignItems: "center", gap: 8 } });
