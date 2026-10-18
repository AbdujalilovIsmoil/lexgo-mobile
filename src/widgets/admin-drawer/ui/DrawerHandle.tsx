import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { Icon } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useDrawer } from "../model/drawerStore";

const open = () => {
  selectHaptic();
  useDrawer.getState().setOpen(true);
};

// A slim tab on the left edge of every admin screen: tap it (or drag it to the right) to open the module switcher.
export function DrawerHandle() {
  const c = useColors();
  const { t } = useT();
  const { height: H } = useWindowDimensions();
  const gesture = Gesture.Exclusive(
    Gesture.Pan().activeOffsetX(10).failOffsetY([-20, 20]).onEnd((e) => { if (e.translationX > 24) scheduleOnRN(open); }),
    Gesture.Tap().onEnd(() => scheduleOnRN(open)),
  );
  return (
    <GestureDetector gesture={gesture}>
      <View collapsable={false} accessible accessibilityRole="button" accessibilityLabel={t("ag1.drawer.open")} style={[s.hit, { top: H * 0.42 }]}>
        <View style={[s.tab, { backgroundColor: c.surface, borderColor: c.line }]}><Icon name="chevron-right" size={14} tone="accent" /></View>
      </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  hit: { position: "absolute", left: 0, width: 30, height: 84, justifyContent: "center", zIndex: 20 },
  tab: { width: 17, height: 52, borderTopRightRadius: 12, borderBottomRightRadius: 12, borderWidth: 1, borderLeftWidth: 0, alignItems: "center", justifyContent: "center", opacity: 0.92 },
});
