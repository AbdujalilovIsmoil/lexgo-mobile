import { useEffect, useRef } from "react";
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GUEST_OPEN } from "./navItems";
import { useSidebarHidden } from "./useSidebarHidden";
import { useTablet } from "@/shared/lib/useTablet";
import { MenuPanel } from "./MenuPanel";
import { useSidebar } from "./sidebarStore";
import { SPRING, useDrawer } from "./useDrawer";

// The sidebar of every role (the client's rows are the web portal's; see navFor for the others). The menu button of the page header (MenuButton)
// opens it; the page dims as it comes and takes no touch, no screen-reader focus and no typing until the drawer is shut again. Tap the dim
// area, drag the drawer (or the dim area) to the left, or press back to close.
export function ClientSidebar() {
  const { t } = useT();
  const router = useRouter();
  const role = useTabRole();
  const { width } = useWindowDimensions();
  const hide = useSidebar((st) => st.hide);
  const w = Math.min(width * 0.84, 340);
  const { x, p, open, driven } = useDrawer(w);
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { hide(); return true; });
    return () => sub.remove();
  }, [open, hide]);
  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: p.value }));
  // A tap on a row can sway sideways by a few points, which starts this pan; the row's own hide() has already begun by then. Once show / hide
  // has driven the drawer (`driven`, cleared by the next touch) the pan neither moves nor settles it, or it would cancel the closing spring and
  // snap back open. A pan that was never activated (a plain tap) settles nothing either.
  // One pan for the panel and one for the dim area (a detector takes its own gesture), both pushing the drawer back under the finger.
  const dragging = useSharedValue(false);
  const pan = () => Gesture.Pan().activeOffsetX(-16).failOffsetY([-14, 14]).onBegin(() => { driven.value = false; }).onStart(() => { dragging.value = true; })
    .onUpdate((e) => { if (!driven.value) x.value = Math.min(0, e.translationX); })
    .onEnd((e, ok) => { if (!ok || driven.value) return; if (e.translationX < -w * 0.3 || e.velocityX < -500) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); })
    .onFinalize((_, ok) => { const was = dragging.value; dragging.value = false; if (!ok && was && !driven.value) { if (x.value < -w * 0.3) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); } }); // a cancelled drag never stays half way
  const drag = pan();
  const dimDrag = pan();
  const hidden = useSidebarHidden();
  const { docked } = useTablet(); // a wide tablet keeps the sidebar open beside the page (TabletFrame): no drawer, no handle
  const going = useRef(false);
  const session = useSession();
  const who = session ? `${session.user.id}:${session.user.backendRole}` : "";
  // The drawer must never stay half-open behind a hidden route, a sign-in/out or a role switch (it would also keep
  // swallowing the Android back button): snap it shut without animation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    x.value = -w;
  }, [hidden, who, w, x]);
  if (hidden || docked) return null;
  // Every role's drawer is the design's navy MenuPanel (a professional's with their own rows); the tablet's docked rail keeps SidebarPanel.
  // A visitor may open the public pages; every other row is personal, so it leads to sign-in. The drawer closes first and the page
  // opens once it is out of the way (a heavy page mounting during the closing spring made both stutter); a second tap while that is
  // pending is ignored.
  const go = (route: string) => {
    if (going.current) return;
    going.current = true;
    hide();
    const to = role === "guest" && !GUEST_OPEN.includes(route.split("?")[0]) ? "/auth/login" : route;
    setTimeout(() => { going.current = false; router.navigate(to as never); if (useSidebar.getState().open) hide(); }, 180); // still out after the spring: close it again
  };
  return (
    <>
      <GestureDetector gesture={dimDrag}>
        <Animated.View pointerEvents={open ? "auto" : "none"} style={[StyleSheet.absoluteFill, s.scrim, scrim]}><Pressable style={s.fill} onPress={hide} accessibilityRole="button" accessibilityLabel={t("a11y.close")} /></Animated.View>
      </GestureDetector>
      <GestureDetector gesture={drag}>
        <Animated.View pointerEvents={open ? "auto" : "none"} accessibilityViewIsModal={open} style={[s.panel, { width: w, backgroundColor: "#0A1430", borderColor: "rgba(255,255,255,0.08)" }, panel]}>
          {/* the panel's empty parts claim the touch too, so it never reaches the page behind (rows and buttons claim theirs first) */}
          <View style={s.fill} onStartShouldSetResponder={() => true}><MenuPanel onGo={go} /></View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: "rgba(3,16,43,0.55)" },
  panel: { position: "absolute", top: 0, bottom: 0, left: 0, borderRightWidth: 1, borderTopRightRadius: 26, borderBottomRightRadius: 26, overflow: "hidden" },
});
