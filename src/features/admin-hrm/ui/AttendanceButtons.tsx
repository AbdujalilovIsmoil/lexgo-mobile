import { View } from "react-native";
import { EVENT_TYPES } from "@/entities/admin-hrm";
import { Button, type ButtonVariant, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAttendanceEvent } from "../model/useWorkActions";

const LOOK: Record<string, { variant: ButtonVariant; icon: IconName }> = {
  check_in: { variant: "gradient", icon: "log-in" }, check_out: { variant: "line", icon: "log-out" },
  break_start: { variant: "soft", icon: "coffee" }, break_end: { variant: "soft", icon: "play" },
};

// Check in / check out / break start / break end — for the signed-in user, or for `employeeId` when given.
export function AttendanceButtons({ employeeId }: { employeeId?: string }) {
  const { t } = useT();
  const ev = useAttendanceEvent();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {EVENT_TYPES.map((type) => (
        <View key={type} style={{ width: "48%", flexGrow: 1 }}>
          <Button title={t(`admHrm.ev.${type}`)} variant={LOOK[type].variant} icon={LOOK[type].icon} full size="sm" loading={ev.isPending && ev.variables?.type === type} disabled={ev.isPending} onPress={() => ev.mutate({ type, employeeId })} />
        </View>
      ))}
    </View>
  );
}
