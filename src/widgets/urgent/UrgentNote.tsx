import { StyleSheet, View } from "react-native";
import { useUrgentFlash } from "@/entities/urgent";
import { useColors } from "@/shared/theme";
import { Icon, IconButton, Text } from "@/shared/ui";

// "Request sent" (or the backend's own sentence when nobody was on duty): the banner the web shows under the hero.
export function UrgentNote() {
  const c = useColors();
  const note = useUrgentFlash((f) => f.note);
  if (!note) return null;
  const tone = note.ok ? c.ok : c.err;
  return (
    <View style={[s.box, { backgroundColor: note.ok ? c.okBg : c.errBg, borderColor: tone }]} accessibilityRole="alert">
      <Icon name={note.ok ? "check-circle" : "alert-circle"} size={22} color={tone} />
      <View style={s.col}>
        <Text variant="body" weight="bold">{note.msg}</Text>
        {note.ok && note.next ? <Text variant="small" tone="gray">{note.next}</Text> : null}
      </View>
      <IconButton icon="x" size={32} onPress={() => useUrgentFlash.getState().show(null, useUrgentFlash.getState().fresh)} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  col: { flex: 1, gap: 3 },
});
