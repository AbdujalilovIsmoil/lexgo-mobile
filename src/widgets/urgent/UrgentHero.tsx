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
const BASE = "#0034A8";

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
          icon: <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />,
          value: t("ug4.minutesN", { n: cat.meetingMinutes }),
          label: t("ug1.metaMinutes"),
        },
        {
          icon: <Gift size={18} color="#FFFFFF" />,
          value: t("ug4.minutesN", { n: cat.freeExtensionMinutes }),
          label: t("ug1.metaFree"),
        },
        ...(cat.paidExtensionPerMinute
          ? [
              {
                icon: <Coins size={18} color="#FFFFFF" />,
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
        colors={["rgba(0,52,168,0)", BASE]}
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
        <View style={s.pill}>
          <Text variant="caption" weight="bold" tone="white" style={s.pillTx}>
            {t("ug1.page.eyebrow").toUpperCase()}
          </Text>
        </View>
        <Text variant="h3" tone="white" style={s.title}>
          {cat?.title || t("ug1.title")}
        </Text>
        <Text variant="small" style={s.dim}>
          {t("ug1.page.lead")}
        </Text>
      </View>
      {loading ? (
        <Skeleton height={64} round={18} onDark />
      ) : cols.length ? (
        <View style={s.strip}>
          {cols.map((x, i) => (
            <View key={x.label} style={[s.col, i > 0 && s.rule]}>
              <View style={s.ico}>{x.icon}</View>
              <View style={s.colTx}>
                <Text
                  variant="small"
                  weight="bold"
                  tone="white"
                  numberOfLines={2}
                >
                  {x.value}
                </Text>
                <Text variant="caption" style={s.dim} numberOfLines={2}>
                  {x.label}
                </Text>
              </View>
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
    paddingBottom: 18,
    gap: 14,
    backgroundColor: BASE,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  art: { position: "absolute", top: 0 },
  fade: { position: "absolute", left: 0, right: 0, height: 61 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS,
  },
  barTitle: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
  },
  // Room on the right so the lines stay mostly off the advocate in the picture.
  texts: { gap: 6, paddingRight: 72 },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  pillTx: { letterSpacing: 0.4 },
  title: { fontSize: 20, lineHeight: 25 },
  dim: { color: DIM },
  strip: {
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 10,
  },
  col: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
  },
  rule: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.16)" },
  ico: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  colTx: { flex: 1, minWidth: 0 },
});
