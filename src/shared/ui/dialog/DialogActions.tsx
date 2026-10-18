import { ActivityIndicator, StyleSheet, View } from "react-native";
import { radius, shadows, useColors } from "@/shared/theme";
import { PressableScale } from "../PressableScale";
import { Icon, type IconName } from "../Icon";
import { Text } from "../Text";

type Props = { cancelLabel: string; confirmLabel: string; icon?: IconName; danger?: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void };

// Two equal pill buttons: a quiet cancel and the (red when destructive) confirm.
export function DialogActions({ cancelLabel, confirmLabel, icon, danger, busy, onCancel, onConfirm }: Props) {
  const c = useColors();
  const main = danger ? "#E5484D" : c.accentStrong;
  return (
    <View style={s.row}>
      <PressableScale onPress={onCancel} disabled={busy} style={[s.btn, { backgroundColor: c.tint2, opacity: busy ? 0.5 : 1 }]}>
        <Text style={{ color: c.ink, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{cancelLabel}</Text>
      </PressableScale>
      <PressableScale onPress={onConfirm} disabled={busy} style={[s.btn, shadows.s2, { backgroundColor: main }]}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : icon ? <Icon name={icon} size={17} color="#FFFFFF" /> : null}
        <Text style={s.confirm}>{confirmLabel}</Text>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  btn: { flex: 1, minHeight: 50, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12 },
  confirm: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
