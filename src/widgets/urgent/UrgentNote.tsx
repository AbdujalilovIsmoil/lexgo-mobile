import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { detailHref, useUrgentFlash } from "@/entities/urgent";
import { useColors } from "@/shared/theme";
import { Icon, IconButton, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Request sent" (or the backend's own sentence when nobody was on duty), under the hero: a green box with a check tile and the
// "open the request" button for the request just made; red with the cross to close it when something went wrong.
export function UrgentNote() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const note = useUrgentFlash((f) => f.note);
  const fresh = useUrgentFlash((f) => f.fresh);
  if (!note) return null;
  const close = () => useUrgentFlash.getState().show(null, useUrgentFlash.getState().fresh);
  if (!note.ok) {
    return (
      <View style={[s.box, { backgroundColor: c.errBg }]} accessibilityRole="alert">
        <View style={[s.tile, { backgroundColor: c.err }]}><Icon name="alert-circle" size={18} color="#FFFFFF" /></View>
        <Text variant="body" weight="bold" style={[s.col, { color: c.err }]}>{note.msg}</Text>
        <IconButton icon="x" size={32} onPress={close} />
      </View>
    );
  }
  return (
    <View style={[s.box, s.ok]} accessibilityRole="alert">
      <View style={[s.tile, { backgroundColor: GREEN }]}><Icon name="check" size={18} color="#FFFFFF" /></View>
      <View style={s.col}>
        <Text variant="body" weight="bold" style={s.okTx}>{note.next ? `${note.msg} ${note.next}` : note.msg}</Text>
        {fresh ? (
          <PressableScale onPress={() => router.push(detailHref("client", fresh))} scale={0.97} style={s.btn} accessibilityRole="button">
            <Text variant="small" weight="bold" tone="white">{t("ug1.page.open")}</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const GREEN = "#43A15A";

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 18 },
  ok: { backgroundColor: "#E6F4EA" },
  tile: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 10 },
  okTx: { color: "#2E7D46" },
  btn: { alignSelf: "flex-start", backgroundColor: GREEN, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
});
