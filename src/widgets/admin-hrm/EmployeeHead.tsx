import { Linking, StyleSheet, View } from "react-native";
import { HrmStatus, type Employee } from "@/entities/admin-hrm";
import { CcAction } from "@/shared/ui/cc";
import { Avatar, Text } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

// Top of the 360 sheet: avatar, status and round call / message buttons.
export function EmployeeHead({ e, place, onMessage }: { e: Employee; place: string; onMessage?: (e: Employee) => void }) {
  const { t } = useT();
  const go = (url: string) => () => { tapHaptic(); void Linking.openURL(url).catch(() => undefined); };
  return (
    <View style={s.row}>
      <Avatar name={e.name} size={56} />
      <View style={s.fill}>
        <HrmStatus status={e.status} />
        <Text variant="caption" tone="gray" numberOfLines={2}>{place || e.phone}</Text>
      </View>
      {e.phone ? <CcAction icon="phone" label={t("admHrmU.call")} onPress={go(`tel:${e.phone}`)} /> : null}
      {onMessage && e.userId ? <CcAction icon="message-circle" label={t("admHrmV.chat")} onPress={() => { tapHaptic(); onMessage(e); }} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10 }, fill: { flex: 1, gap: 4, alignItems: "flex-start" } });
