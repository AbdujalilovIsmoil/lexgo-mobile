import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import { ChevronLeft, Gift, Wallet, Zap } from "lucide-react-native";
import { FocusStatusBar, PressableScale, Skeleton, Text } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { SupportMenu } from "@/features/support-menu";
import type { UrgentCatalog } from "@/entities/urgent";

// Adliya .ug-hero: navy #0B2A6B, a blue glow from the top right corner and faint diagonal stripes, rounded bottom corners.
const BASE = "#0B2A6B";
const DIM = "rgba(255,255,255,0.8)";
const GLASS = "rgba(255,255,255,0.14)";
const GLASS_LINE = "rgba(255,255,255,0.18)";

// repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 2px, transparent 2px 12px) — the stripes as an SVG pattern.
function Stripes() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="ugStripes" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Rect x={0} y={0} width={2} height={12} fill="#FFFFFF" fillOpacity={0.05} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#ugStripes)" />
    </Svg>
  );
}

// The fixed top of the client's /urgent (Adliya .ug-hero): back, the title, support; then the "straight to an advocate" eyebrow pill, the
// module's name and one line about it, and the three numbers every meeting runs on (meeting / free extension / paid extension) as a glass
// strip of icon tiles, all from the catalog.
// `noBack`: the Tezkor tab — nothing to go back to, an empty slot keeps the title in its place.
export function UrgentHero({ cat, loading, noBack }: { cat?: UrgentCatalog; loading: boolean; noBack?: boolean }) {
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const cols: { icon: ReactNode; value: string; label: string }[] = cat
    ? [
        { icon: <Zap size={14} color="#FFFFFF" />, value: t("ug4.minutesN", { n: cat.meetingMinutes }), label: t("ug1.metaMinutes") },
        { icon: <Gift size={14} color="#FFFFFF" />, value: t("ug4.minutesN", { n: cat.freeExtensionMinutes }), label: t("ug1.metaFree") },
        ...(cat.paidExtensionPerMinute
          ? [{ icon: <Wallet size={14} color="#FFFFFF" />, value: t("ug1.perMinute", { price: fmtMoney(cat.paidExtensionPerMinute) }), label: t("ug1.metaPaid") }]
          : []),
      ]
    : [];
  return (
    <View style={[s.box, { paddingTop: insets.top + HEADER_GAP }]}>
      <LinearGradient pointerEvents="none" colors={["rgba(43,94,234,0.6)", "rgba(43,94,234,0)"]} start={{ x: 1, y: 0 }} end={{ x: 0.35, y: 0.7 }} style={StyleSheet.absoluteFill} />
      <Stripes />
      <FocusStatusBar style="light" />
      <View style={s.bar}>
        {noBack ? <View style={s.slot} /> : (
          <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("svc.detail.back")} style={s.back}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </PressableScale>
        )}
        <Text numberOfLines={1} style={s.barTitle}>{t("ug1.title")}</Text>
        <SupportMenu glass client />
      </View>
      <View style={s.texts}>
        <View style={s.eyebrow}>
          <Zap size={12} color="#FFFFFF" />
          <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={s.eyebrowTx}>{t("ug1.page.eyebrow").toUpperCase()}</Text>
        </View>
        <Text numberOfLines={2} maxFontSizeMultiplier={1.2} style={s.title}>{cat?.title || t("ug1.title")}</Text>
        <Text maxFontSizeMultiplier={1.2} style={s.lead}>{t("ug1.page.lead")}</Text>
      </View>
      {loading ? (
        <Skeleton height={86} round={16} onDark />
      ) : cols.length ? (
        <View style={s.strip}>
          {cols.map((x, i) => (
            <View key={x.label} style={[s.col, i > 0 && s.rule]}>
              <View style={s.ico}>{x.icon}</View>
              <Text weight="bold" tone="white" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.colVal}>{x.value}</Text>
              <Text numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.colLbl}>{x.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { paddingHorizontal: 18, paddingBottom: 16, gap: 14, backgroundColor: BASE, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden" },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: -6 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_LINE },
  slot: { width: 40, height: 40 },
  barTitle: { flex: 1, minWidth: 0, color: "#FFFFFF", fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
  texts: { alignItems: "flex-start" },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: GLASS, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  eyebrowTx: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 10.5, lineHeight: 14, letterSpacing: 1.05 },
  title: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 26, lineHeight: 32, marginTop: 10, marginBottom: 4 },
  lead: { color: DIM, fontSize: 13.5, lineHeight: 19 },
  strip: { flexDirection: "row", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: GLASS_LINE, paddingVertical: 10, paddingHorizontal: 4 },
  col: { flex: 1, minWidth: 0, alignItems: "center", gap: 4, paddingHorizontal: 4 },
  rule: { borderLeftWidth: 1, borderLeftColor: GLASS_LINE },
  ico: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: GLASS, marginBottom: 2 },
  colVal: { fontSize: 13, lineHeight: 17, textAlign: "center" },
  colLbl: { color: "rgba(255,255,255,0.75)", fontSize: 11, lineHeight: 14, textAlign: "center" },
});
