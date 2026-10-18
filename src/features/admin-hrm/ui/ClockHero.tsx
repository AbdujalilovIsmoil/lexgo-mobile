import { View } from "react-native";
import { useToday } from "@/entities/admin-hrm";
import { CcAction } from "@/shared/ui/cc";
import { Button } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { useAttendanceEvent } from "../model/useWorkActions";

// The hero action of attendance: one big clock-in / clock-out button plus round break start / end buttons.
export function ClockHero() {
  const { t } = useT();
  const ev = useAttendanceEvent();
  const day = useToday().data?.attendance;
  const out = !!day?.firstIn && !day.lastOut;
  const type = out ? "check_out" : "check_in";
  const fire = (v: string) => () => { tapHaptic(); ev.mutate({ type: v }); };
  const busy = (v: string) => ev.isPending && ev.variables?.type === v;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Button title={t(out ? "admHrmW.clockOut" : "admHrmW.clockIn")} variant={out ? "line" : "gradient"} icon={out ? "log-out" : "log-in"} size="lg" full loading={busy(type)} disabled={ev.isPending} onPress={fire(type)} />
      </View>
      <CcAction icon="coffee" label={t("admHrm.ev.break_start")} loading={busy("break_start")} onPress={fire("break_start")} />
      <CcAction icon="play" label={t("admHrm.ev.break_end")} loading={busy("break_end")} onPress={fire("break_end")} />
    </View>
  );
}
