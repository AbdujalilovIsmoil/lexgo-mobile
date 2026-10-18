import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useDemo } from "./demoStore";

// The "Demo" switch in the header's row of round buttons (next to support, bell and avatar): a round button that lights up with a
// bright dot while the sample data is on. Pressing it refreshes every query, so the page redraws at once with the demo data — or
// with the real data again.
export function DemoPill({ glass }: { glass?: boolean }) {
  const { t } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const on = useDemo((s) => s.on);
  const flip = () => { selectHaptic(); useDemo.getState().set(!on); void qc.invalidateQueries(); };
  return (
    <View style={[s.wrap, on && { backgroundColor: c.accent, borderColor: "#FFFFFF" }]}>
      <IconButton icon="layers" size={40} tone={glass ? "glass" : "tint"} onPress={flip} label={on ? t("shm.demo.on") : t("shm.demo.label")} />
      {on ? <View style={s.dot} pointerEvents="none" /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 40, height: 40, borderRadius: 20, borderWidth: 0 },
  dot: { position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#FFFFFF" },
});
