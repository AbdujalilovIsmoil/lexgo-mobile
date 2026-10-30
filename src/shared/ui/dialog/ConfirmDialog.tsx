import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { radius, shadows, useColors, usePaneColor, useTheme } from "@/shared/theme";
import { GlassBackdrop, useGlass } from "../GlassBackdrop";
import { errorHaptic } from "@/shared/lib/haptics";
import { useKept } from "@/shared/lib/useKept";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { DialogActions } from "./DialogActions";
import { useDialogStore } from "./dialogStore";
import { useDialogMotion } from "./useDialogMotion";

// A real in-app confirm dialog (mounted once at the root): dimmed backdrop, a
// card that springs in, round status icon, two pill buttons. Backdrop tap and
// the Android back button cancel it; while the action runs it can't be dismissed.
export function ConfirmDialog() {
  const c = useColors();
  const { dark } = useTheme();
  const pane = usePaneColor();
  const lens = !!useGlass();
  const live = useDialogStore((st) => st.spec);
  const close = useDialogStore((st) => st.close);
  const spec = useKept(live);
  const [busy, setBusy] = useState(false);
  const { shown, dim, card } = useDialogMotion(!!live);
  if (!spec || !shown) return null;

  const cancel = () => !busy && close();
  const confirm = async () => {
    setBusy(true);
    try {
      await spec.onConfirm();
      close();
    } catch {
      errorHaptic();
    } finally {
      setBusy(false);
    }
  };
  const tone = spec.danger ? c.err : c.accent;
  const m3 = Platform.OS === "android"; // Material 3 dialog: 28dp corners, text left-aligned, text buttons at the end
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={cancel}>
      <View style={s.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#020A1C" }, dim]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityLabel="close" />
        </Animated.View>
        <Animated.View style={[s.card, shadows.s2, { backgroundColor: lens ? "transparent" : pane, borderColor: c.line }, m3 && s.cardStart, card]}>
          {lens ? <GlassBackdrop radius={radius.rx} tint={dark ? "rgba(10,17,32,0.6)" : "rgba(255,255,255,0.7)"} /> : null}
          <View style={[s.ring, { backgroundColor: spec.danger ? c.errBg : c.tint2 }, m3 && s.ringStart]}>
            <View style={[s.badge, { backgroundColor: spec.danger ? c.errBg : c.tint2, borderColor: tone }]}>
              <Icon name={spec.icon ?? "help-circle"} size={28} color={tone} />
            </View>
          </View>
          <Text variant="h3" center={!m3} style={m3 && s.start}>{spec.title}</Text>
          <Text variant="small" tone="gray" center={!m3} style={[s.msg, m3 && s.start]}>{spec.message}</Text>
          <DialogActions cancelLabel={spec.cancelLabel} confirmLabel={spec.confirmLabel} icon={spec.confirmIcon ?? spec.icon} danger={spec.danger} busy={busy} onCancel={cancel} onConfirm={() => void confirm()} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  // Full width on a phone, 380 at most and centred on a tablet (with "stretch" the capped card stuck to the left edge).
  card: { width: "100%", maxWidth: 380, alignSelf: "center", borderRadius: radius.rx, borderWidth: 1, padding: 22, paddingTop: 26, gap: 10, alignItems: "center" },
  ring: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 6, opacity: 0.9 },
  badge: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  msg: { marginBottom: 12, paddingHorizontal: 6 },
  cardStart: { alignItems: "flex-start", borderWidth: 0 },
  ringStart: { alignSelf: "flex-start", width: 58, height: 58, backgroundColor: "transparent", marginBottom: 2 },
  start: { alignSelf: "stretch", textAlign: "left" },
});
