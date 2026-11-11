import type { ReactNode } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft, Coins, Gift, Zap } from "lucide-react-native";
import {
  FocusStatusBar,
  HeaderRight,
  PressableScale,
  Skeleton,
  Text,
} from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { UrgentCatalog } from "@/entities/urgent";

const BG = require("../../../assets/services/teskorBg.png") as number;
// The picture's bottom edge is this blue all along: the block's own colour under it, so the picture can be drawn smaller than the block.
// A deeper, less saturated navy than the picture's own blue: with the picture at reduced opacity on top, the whole block reads calmer.
const BASE = "#0B2A6B";

const DIM = "rgba(255,255,255,0.8)";
const GLASS = "rgba(255,255,255,0.14)";

// The fixed top of the client's /urgent as ONE blue block from under the status bar (one gradient, no seam between the header and the
// hero) on the teskorBg picture (the faded advocate is in it, on the right): back, title, support; then the eyebrow pill, the module's name
// and one line about it, and the three
// numbers every meeting runs on (meeting / free extension / paid extension) as icon tiles, all from the catalog.
export function UrgentHero({
  cat,
  loading,
}: {
  cat?: UrgentCatalog;
  loading: boolean;
}) {
  const { t } = useT();
  const insets = useInsets();
  const { width } = useWindowDimensions();
  // The picture (3:2), 15% wider than the screen and pulled left by that 15% (its right edge on the screen's): the advocate on its right
  // sits smaller and further in than with a cover fill.
  const art = {
    width: width * 1.15,
    height: (width * 1.15) / 1.5,
    left: -width * 0.15,
  };
  const router = useRouter();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const cols: { icon: ReactNode; value: string; label: string }[] = cat
    ? [
        {
          icon: <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />,
          value: t("ug4.minutesN", { n: cat.meetingMinutes }),
          label: t("ug1.metaMinutes"),
        },
        {
          icon: <Gift size={14} color="#FFFFFF" />,
          value: t("ug4.minutesN", { n: cat.freeExtensionMinutes }),
          label: t("ug1.metaFree"),
        },
        ...(cat.paidExtensionPerMinute
          ? [
              {
                icon: <Coins size={14} color="#FFFFFF" />,
                value: t("ug1.perMinute", {
                  price: fmtMoney(cat.paidExtensionPerMinute),
                }),
                label: t("ug1.metaPaid"),
              },
            ]
          : []),
      ]
    : [];
  return (
    <View style={[s.box, { paddingTop: insets.top + HEADER_GAP }]}>
      <Image
        source={BG}
        resizeMode="cover"
        style={[s.art, art]}
        accessibilityIgnoresInvertColors
      />
      {/* The picture's last strip melts into BASE, so where it ends (on a tall block) there is no line. */}
      <LinearGradient
        colors={["rgba(11,42,107,0)", BASE]}
        style={[s.fade, { top: art.height - 60 }]}
        pointerEvents="none"
      />
      <FocusStatusBar style="light" />
      <View style={s.bar}>
        <PressableScale
          onPress={back}
          scale={0.94}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("svc.detail.back")}
          style={s.back}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </PressableScale>
        <Text numberOfLines={1} style={s.barTitle}>
          {t("ug1.title")}
        </Text>
        <HeaderRight glass />
      </View>
      <View style={s.texts}>
        <Text variant="h3" tone="white" style={s.title}>
          {cat?.title || t("ug1.title")}
        </Text>
        <Text variant="caption" style={s.dim}>
          {t("ug1.page.lead")}
        </Text>
      </View>
      {loading ? (
        <Skeleton height={72} round={16} onDark />
      ) : cols.length ? (
        <View style={s.strip}>
          {cols.map((x, i) => (
            <View key={x.label} style={[s.col, i > 0 && s.rule]}>
              <View style={s.ico}>{x.icon}</View>
              <Text
                variant="caption"
                weight="bold"
                tone="white"
                numberOfLines={1}
                style={s.colVal}
              >
                {x.value}
              </Text>
              <Text
                variant="caption"
                numberOfLines={2}
                style={[s.dim, s.colLbl]}
              >
                {x.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    backgroundColor: BASE,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  // Toned down so the picture's blue doesn't shout; BASE shows through underneath.
  art: { position: "absolute", top: 0, opacity: 0.55 },
  fade: { position: "absolute", left: 0, right: 0, height: 61 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS,
  },
  barTitle: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 24,
  },
  // Room on the right so the lines stay mostly off the advocate in the picture.
  texts: { gap: 4, paddingRight: 72 },
  title: { fontSize: 18, lineHeight: 22 },
  dim: { color: DIM },
  strip: {
    flexDirection: "row",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 8,
  },
  // Icon on top, value and label centred under it.
  col: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 4,
  },
  rule: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.16)" },
  ico: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  colVal: { fontSize: 12, lineHeight: 15, textAlign: "center" },
  colLbl: { fontSize: 10, lineHeight: 13, textAlign: "center" },
});
