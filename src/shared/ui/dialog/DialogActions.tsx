import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { radius, shadows, useColors } from "@/shared/theme";
import { PressableScale } from "../PressableScale";
import { Icon, type IconName } from "../Icon";
import { Text } from "../Text";

type Props = { cancelLabel: string; confirmLabel: string; icon?: IconName; danger?: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void };

// Two equal pill buttons: a quiet cancel and the (red when destructive) confirm. No cancel label = a notice with its one button.
export function DialogActions({ cancelLabel, confirmLabel, icon, danger, busy, onCancel, onConfirm }: Props) {
  const c = useColors();
  const main = danger ? "#E5484D" : c.accentStrong;
  if (Platform.OS === "android") {
    // Material 3 dialog actions: two text buttons at the end, the confirm in the brand (or error) colour
    return (
      <View style={s.end}>
        {cancelLabel ? (
          <PressableScale onPress={onCancel} disabled={busy} style={[s.text, { opacity: busy ? 0.5 : 1 }]}>
            <Text style={{ color: c.accentStrong, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{cancelLabel}</Text>
          </PressableScale>
        ) : null}
        <PressableScale onPress={onConfirm} disabled={busy} style={s.text}>
          {busy ? <ActivityIndicator color={main} /> : null}
          <Text style={{ color: danger ? "#D92D20" : c.accentStrong, fontFamily: "Inter_700Bold", fontSize: 15 }}>{confirmLabel}</Text>
        </PressableScale>
      </View>
    );
  }
  return (
    <View style={s.row}>
      {cancelLabel ? (
        <PressableScale onPress={onCancel} disabled={busy} style={[s.btn, { backgroundColor: c.tint2, opacity: busy ? 0.5 : 1 }]}>
          <Text style={{ color: c.ink, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{cancelLabel}</Text>
        </PressableScale>
      ) : null}
      <PressableScale onPress={onConfirm} disabled={busy} style={[s.btn, shadows.s2, { backgroundColor: main }]}>
        {busy ? <ActivityIndicator color="#FFFFFF" /> : icon ? <Icon name={icon} size={17} color="#FFFFFF" /> : null}
        <Text style={s.confirm}>{confirmLabel}</Text>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  end: { flexDirection: "row", gap: 8, alignSelf: "stretch", justifyContent: "flex-end" },
  text: { minHeight: 48, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 },
  btn: { flex: 1, minHeight: 50, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12 },
  confirm: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 15, flexShrink: 1, textAlign: "center" }, // a long label wraps inside the pill, never past its icon
});
