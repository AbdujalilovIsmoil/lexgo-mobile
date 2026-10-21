import { useEffect } from "react";
import { BackHandler, StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSession } from "@/entities/session";
import { useColors, useTheme } from "@/shared/theme";
import { GlassBackdrop, useGlass } from "@/shared/ui";
import { useOwnSidebar, useTabRole } from "@/widgets/tab-bar/useTabRole";
import { GUEST_OPEN } from "./navItems";
import { SidebarHandle } from "./SidebarHandle";
import { SidebarPanel } from "./SidebarPanel";
import { useSidebar } from "./sidebarStore";
import { SPRING, useDrawer } from "./useDrawer";

// Screens that need the whole width (rooms, calls, auth, the assistant): no sidebar there. Every role has one.
// The admin area has its own module switcher on the same edge, so it gets no second handle (`manage`, see below) — except for a
// sales operator or an on-duty call-centre lawyer, whose sidebar rows already include those screens: they keep this sidebar and no module switcher is drawn.
const HIDE = new Set(["auth", "chat", "call", "lawyer", "assistant", "instructor", "specialist", "sel-dev", "cc-preview"]);

// The sidebar of every role (the client's rows are the web portal's; see navFor for the others). The handle on the left edge (or a drag from it) pulls the
// drawer out; the page dims as it comes. Tap the dim area, drag the drawer left, or press back to close.
export function ClientSidebar() {
  const c = useColors();
  const { dark } = useTheme();
  const lens = !!useGlass(true); // the drawer stays glass
  const router = useRouter();
  const seg = useSegments();
  const role = useTabRole();
  const { width } = useWindowDimensions();
  const { show, hide } = useSidebar();
  const w = Math.min(width * 0.84, 340);
  const { x, p, open } = useDrawer(w);
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { hide(); return true; });
    return () => sub.remove();
  }, [open, hide]);
  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: p.value }));
  /* eslint-disable react-hooks/immutability */
  const drag = Gesture.Pan().activeOffsetX(-10).onUpdate((e) => { x.value = Math.min(0, e.translationX); })
    .onEnd((e, ok) => { if (!ok) return; if (e.translationX < -w * 0.3 || e.velocityX < -500) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); })
    .onFinalize((_, ok) => { if (!ok) { if (x.value < -w * 0.3) scheduleOnRN(hide); else x.value = withSpring(0, SPRING); } }); // a cancelled drag never stays half way
  /* eslint-enable react-hooks/immutability */
  const ownSidebar = useOwnSidebar();
  const manage = seg[0] === "manage" && (!ownSidebar || seg[1] === "call" || seg[1] === "chat");
  const hidden = HIDE.has(String(seg[0])) || manage || (seg[0] === "(tabs)" && seg[1] === "ai");
  const session = useSession();
  const who = session ? `${session.user.id}:${session.user.backendRole}` : "";
  // The drawer must never stay half-open behind a hidden route, a sign-in/out or a role switch (it would also keep
  // swallowing the Android back button): snap it shut without animation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    x.value = -w;
  }, [hidden, who, w, x]);
  if (hidden) return null;
  // A visitor may open the public pages; every other row is personal, so it leads to sign-in.
  const go = (route: string) => { hide(); router.navigate((role === "guest" && !GUEST_OPEN.includes(route.split("?")[0]) ? "/auth/login" : route) as never); };
  return (
    <>
      <Animated.View pointerEvents={open ? "auto" : "none"} style={[StyleSheet.absoluteFill, s.scrim, scrim]}><View style={s.fill} onTouchEnd={hide} /></Animated.View>
      <GestureDetector gesture={drag}>
        <Animated.View pointerEvents={open ? "auto" : "none"} style={[s.panel, { width: w, backgroundColor: lens ? "transparent" : c.surface, borderColor: c.line }, panel]}>
          {lens ? <GlassBackdrop always radius={0} tint={dark ? "rgba(10,17,32,0.6)" : "rgba(255,255,255,0.68)"} /> : null}
          <SidebarPanel p={p} onGo={go} />
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
