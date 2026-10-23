import { useEffect, useRef } from "react";
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { useColors, useTheme } from "@/shared/theme";
import { GlassBackdrop, useGlass } from "@/shared/ui";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GUEST_OPEN } from "./navItems";
import { useSidebarHidden } from "./useSidebarHidden";
import { useTablet } from "@/shared/lib/useTablet";
import { SidebarHandle } from "./SidebarHandle";
import { SidebarPanel } from "./SidebarPanel";
import { useSidebar } from "./sidebarStore";
import { SPRING, useDrawer } from "./useDrawer";

// The sidebar of every role (the client's rows are the web portal's; see navFor for the others). The handle on the left edge (or a drag from it) pulls the
// drawer out; the page dims as it comes. Tap the dim area, drag the drawer left, or press back to close.
export function ClientSidebar() {
  const { t } = useT();
  const c = useColors();
  const { dark } = useTheme();
  const lens = !!useGlass(true); // the drawer stays glass
  const router = useRouter();
  const role = useTabRole();
  const { width } = useWindowDimensions();
  const { show, hide } = useSidebar();
  const w = Math.min(width * 0.84, 340);
  const { x, p, open, driven } = useDrawer(w);
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { hide(); return true; });
    return () => sub.remove();
  }, [open, hide]);
  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: p.value }));
  /* eslint-disable react-hooks/immutability */
  // A tap on a row can sway sideways by a few points, which starts this pan; the row's own hide() has already begun by then. Once show / hide
  // has driven the drawer (`driven`, cleared by the next touch) the pan neither moves nor settles it, or it would cancel the closing spring and
  // snap back open. A pan that was never activated (a plain tap) settles nothing either.
  const dragging = useSharedValue(false);
  const drag = Gesture.Pan().activeOffsetX(-16).failOffsetY([-14, 14]).onBegin(() => { driven.value = false; }).onStart(() => { dragging.value = true; })
    .onUpdate((e) => { if (!driven.value) x.value = Math.min(0, e.translationX); })
    .onEnd((e, ok) => { if (!ok || driven.value) return; if (e.translationX < -w * 0.3 || e.velocityX < -500) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); })
    .onFinalize((_, ok) => { const was = dragging.value; dragging.value = false; if (!ok && was && !driven.value) { if (x.value < -w * 0.3) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); } }); // a cancelled drag never stays half way
  /* eslint-enable react-hooks/immutability */
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
      <Animated.View pointerEvents={open ? "auto" : "none"} style={[StyleSheet.absoluteFill, s.scrim, scrim]}><Pressable style={s.fill} onPress={hide} accessibilityRole="button" accessibilityLabel={t("a11y.close")} /></Animated.View>
      <GestureDetector gesture={drag}>
        <Animated.View pointerEvents={open ? "auto" : "none"} style={[s.panel, { width: w, backgroundColor: lens ? "transparent" : c.surface, borderColor: c.line }, panel]}>
          {lens ? <GlassBackdrop always radius={0} tint={dark ? "rgba(10,17,32,0.6)" : "rgba(255,255,255,0.68)"} /> : null}
          {/* the panel's empty parts claim the touch too, so it never reaches the page behind (rows and buttons claim theirs first) */}
          <View style={s.fill} onStartShouldSetResponder={() => true}><SidebarPanel p={p} onGo={go} /></View>
        </Animated.View>
      </GestureDetector>
      <SidebarHandle x={x} p={p} w={w} onOpen={show} onClose={hide} />
    </>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: "rgba(3,16,43,0.55)" },
  panel: { position: "absolute", top: 0, bottom: 0, left: 0, borderRightWidth: 1, borderTopRightRadius: 26, borderBottomRightRadius: 26, overflow: "hidden" },
});
