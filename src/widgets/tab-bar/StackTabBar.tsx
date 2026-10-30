import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useIsAuthed } from "@/entities/session";
import { useBadge } from "@/shared/lib";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { Icon, LiquidGlass, PressableScale, Text, useLiquidGlass } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { AiRaisedButton } from "./AiRaisedButton";
import type { TabDef } from "./tabConfig";
import { useVisibleTabs } from "./useTabItems";

// The geometry of iOS 26's system tab bar, so this bar sits exactly where that one does (measured against it on screen): its bottom
// 19 pt below this page's safe area, 62 pt tall, 21 pt in from each side.
const BAR_LIFT = -19;
const BAR_HEIGHT = 62;
const SIDE = 21;

// iOS: a tab page the system bar does not hold (the profile, the directory, orders) opens as a stack screen (/m/<name>), where the system
// bar cannot be shown. This bar stands in for it, drawn like it — a capsule of Liquid Glass, the same icons and 11 pt captions, the badge,
// and the very same raised AI button over the middle slot — so moving between Home and the profile shows one bar.
export function StackTabBar() {
  const router = useRouter();
  const insets = useInsets();
  const { dark } = useTheme();
  const authed = useIsAuthed();
  const glass = useLiquidGlass();
  const defs = useVisibleTabs();
  const [box, setBox] = useState({ w: 0, h: 0 });
  if (Platform.OS !== "ios") return null;
  const ai = defs.find((d) => d.center);
  const press = (d: TabDef) => {
    selectHaptic();
    if (d.auth && !authed) return router.push("/auth/login");
    router.navigate((d.route === "index" ? "/" : `/(tabs)/${d.route}`) as never);
  };
  return (
    <>
      <View pointerEvents="box-none" style={[s.wrap, { bottom: insets.bottom + BAR_LIFT }]}>
        <View onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={s.capsule}>
          {glass ? <LiquidGlass width={box.w} height={box.h} interactive /> : <BlurView tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} intensity={90} style={[StyleSheet.absoluteFill, s.round]} />}
          {defs.map((d) => <Item key={d.route} def={d} dark={dark} onPress={() => press(d)} />)}
        </View>
      </View>
      {ai ? <View pointerEvents="box-none" style={StyleSheet.absoluteFill}><AiRaisedButton labelKey={ai.labelKey} /></View> : null}
    </>
  );
}

// One slot as the system bar draws it: the icon over an 11 pt caption in the label colour of the theme; the AI slot keeps only its caption
// (the raised button stands over it); the unread count as the system's red pill.
function Item({ def, dark, onPress }: { def: TabDef; dark: boolean; onPress: () => void }) {
  const { t } = useT();
  const n = useBadge(def.badge);
  const tint = dark ? "#FFFFFF" : "#1C1C1E";
  return (
    <PressableScale onPress={def.center ? undefined : onPress} disabled={def.center} haptic={false} scale={0.92} accessibilityRole="button" accessibilityLabel={t(def.labelKey)} style={s.item}>
      <View style={s.icon}>
        {def.center ? null : <Icon name={def.icon} size={25} color={tint} />}
        {n ? <View style={s.badge}><Text variant="caption" weight="bold" tone="white" style={s.badgeTx}>{n > 99 ? "99+" : n}</Text></View> : null}
      </View>
      <Text numberOfLines={1} allowFontScaling={false} style={[s.label, { color: tint }]}>{t(def.labelKey)}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: SIDE, right: SIDE },
  capsule: { flexDirection: "row", alignItems: "center", height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, paddingHorizontal: 4, overflow: "visible" },
  round: { borderRadius: BAR_HEIGHT / 2, overflow: "hidden" },
  item: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 5, gap: 1, height: BAR_HEIGHT },
  icon: { height: 27, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10.5, lineHeight: 13, fontWeight: "500" },
  badge: { position: "absolute", top: -4, left: 14, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center" },
  badgeTx: { fontSize: 12, lineHeight: 15 },
});
