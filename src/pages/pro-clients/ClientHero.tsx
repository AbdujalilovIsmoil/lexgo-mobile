import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FocusStatusBar, Icon, PressableScale, Text, backIcon } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const PLACEHOLDER = require("../../../assets/placeholderImage.png") as number;

// The top of the client card (as the client side's specialist page): the app's placeholder picture the full width of the screen from under the
// status bar, darkened towards the bottom, the glass back button on it and, at its foot, a pill (active cases / chat / own base), the name in
// large white type and phone · region.
export function ClientHero({ name, pill, sub }: { name: string; pill?: string; sub?: string }) {
  const insets = useInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useT();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/clients" as never));
  const height = Math.round(Math.min(width * 0.86, 400));
  return (
    <View style={[s.hero, { height }]}>
      <FocusStatusBar style="light" />
      <Image source={PLACEHOLDER} resizeMode="cover" style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors />
      <LinearGradient pointerEvents="none" colors={["rgba(8,18,38,0.55)", "rgba(8,18,38,0)"]} style={[s.topShade, { height: insets.top + 90 }]} />
      <LinearGradient pointerEvents="none" colors={["rgba(8,18,38,0)", "rgba(8,18,38,0.6)", "rgba(8,18,38,0.94)"]} locations={[0, 0.45, 1]} style={s.bottomShade} />
      <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
        <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.icon.chevron-left")} style={s.btn}><Icon name={backIcon} size={21} color="#FFFFFF" /></PressableScale>
      </View>
      <View style={s.foot}>
        {pill ? <View style={s.pill}><Text variant="caption" weight="bold" style={s.pillTx}>{pill}</Text></View> : null}
        <Text numberOfLines={2} maxFontSizeMultiplier={1.2} style={s.name}>{name || "—"}</Text>
        {sub ? <Text variant="body" numberOfLines={1} style={s.dim}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { width: "100%", overflow: "hidden", backgroundColor: "#0B1A33", justifyContent: "flex-end" },
  topShade: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  bar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", paddingHorizontal: 16 },
  btn: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  foot: { paddingHorizontal: 18, paddingBottom: 38, gap: 6, alignItems: "flex-start" },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  pillTx: { color: "#FFFFFF" },
  name: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  dim: { color: "rgba(255,255,255,0.78)" },
});
