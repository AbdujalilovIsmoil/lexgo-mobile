import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { radius, shadows, useColors } from "@/shared/theme";
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
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={cancel}>
      <View style={s.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#020A1C" }, dim]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityLabel="close" />
        </Animated.View>
        <Animated.View style={[s.card, shadows.s2, { backgroundColor: c.surface, borderColor: c.line }, card]}>
          <View style={[s.ring, { backgroundColor: spec.danger ? c.errBg : c.tint2 }]}>
            <View style={[s.badge, { backgroundColor: spec.danger ? c.errBg : c.tint2, borderColor: tone }]}>
              <Icon name={spec.icon ?? "help-circle"} size={28} color={tone} />
            </View>
          </View>
          <Text variant="h3" center>{spec.title}</Text>
          <Text variant="small" tone="gray" center style={s.msg}>{spec.message}</Text>
          <DialogActions cancelLabel={spec.cancelLabel} confirmLabel={spec.confirmLabel} icon={spec.icon} danger={spec.danger} busy={busy} onCancel={cancel} onConfirm={() => void confirm()} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { alignSelf: "stretch", maxWidth: 380, borderRadius: radius.rx, borderWidth: 1, padding: 22, paddingTop: 26, gap: 10, alignItems: "center" },
  ring: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 6, opacity: 0.9 },
  badge: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  msg: { marginBottom: 12, paddingHorizontal: 6 },
});
