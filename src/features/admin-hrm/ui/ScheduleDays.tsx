import { View } from "react-native";
import { WEEK_DAYS, maskTime } from "@/entities/admin-hrm";
import { SwitchField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type DayCfg = { on: boolean; start: string; end: string };
export const defaultDays = (): DayCfg[] => WEEK_DAYS.map((_, i) => ({ on: i < 5, start: "09:00", end: "18:00" }));

// Weekly editor: a switch per weekday and, for working days, start / end times typed as HH:MM.
export function ScheduleDays({ days, onChange }: { days: DayCfg[]; onChange: (d: DayCfg[]) => void }) {
  const { t } = useT();
  const set = (i: number, patch: Partial<DayCfg>) => onChange(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  return (
    <View style={{ gap: 12 }}>
      {WEEK_DAYS.map((name, i) => (
        <View key={name} style={{ gap: 8 }}>
          <SwitchField label={t(`admHrmC.days.${name}`)} value={days[i].on} onChange={(on) => set(i, { on })} />
          {days[i].on ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><Input label={t("admHrmC.start")} value={days[i].start} onChangeText={(x) => set(i, { start: maskTime(x) })} keyboardType="number-pad" maxLength={5} placeholder="09:00" /></View>
              <View style={{ flex: 1 }}><Input label={t("admHrmC.end")} value={days[i].end} onChangeText={(x) => set(i, { end: maskTime(x) })} keyboardType="number-pad" maxLength={5} placeholder="18:00" /></View>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
