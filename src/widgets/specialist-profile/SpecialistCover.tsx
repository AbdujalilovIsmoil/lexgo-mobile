import { useState } from "react";
import { Image, Share, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { FocusStatusBar, Icon, PressableScale, Text, backIcon } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const PLACEHOLDER = require("../../../assets/placeholderImage.png") as number;

// The top of a specialist's page: his photo the full width of the screen from under the status bar (the app's placeholder when he has none or
// it fails to load), darkened towards the bottom, with the glass back and share buttons on it and, at its foot, the green "verified" pill, the
// name with the blue check and the type · region in white. Share sends the public web page (lexgo.uz/<locale>/lawyers/<id>).
export function SpecialistCover({ lawyer: l }: { lawyer: Lawyer }) {
  const insets = useInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const [failed, setFailed] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const share = () => { void Share.share({ message: `https://lexgo.uz/${locale}/lawyers/${encodeURIComponent(l.userId)}` }).catch(() => undefined); };
  const kind = t(l.kind === "advocate" ? "lawyers.card.kindAdvocate" : "lawyers.card.kindLawyer");
  const region = l.region ? geo.region(l.region) : "";
  const height = Math.round(Math.min(width * 1.02, 460));
  const uri = l.photo && !failed ? l.photo : undefined;
  return (
    <View style={[s.hero, { height }]}>
      <FocusStatusBar style="light" />
      <Image source={uri ? { uri } : PLACEHOLDER} onError={() => setFailed(true)} resizeMode="cover" style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors accessibilityLabel={l.name} />
      <LinearGradient pointerEvents="none" colors={["rgba(8,18,38,0.55)", "rgba(8,18,38,0)"]} style={[s.topShade, { height: insets.top + 90 }]} />
      <LinearGradient pointerEvents="none" colors={["rgba(8,18,38,0)", "rgba(8,18,38,0.55)", "rgba(8,18,38,0.92)"]} locations={[0, 0.45, 1]} style={s.bottomShade} />
      <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
        <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.icon.chevron-left")} style={s.btn}><Icon name={backIcon} size={21} color="#FFFFFF" /></PressableScale>
        <PressableScale onPress={share} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.icon.share")} style={s.btn}><Icon name="share" size={19} color="#FFFFFF" /></PressableScale>
      </View>
      <View style={s.foot}>
        {l.verified ? (
          <View style={s.ok}>
            <Ionicons name="checkmark-circle" size={15} color="#4ADE80" />
            <Text variant="caption" weight="bold" style={s.okTx}>{t("mkd.hero.verified")}</Text>
          </View>
        ) : null}
        <View style={s.nameRow}>
          <Text numberOfLines={2} maxFontSizeMultiplier={1.2} style={s.name}>{l.name}</Text>
          {l.verified ? <Ionicons name="checkmark-circle" size={22} color="#4F8BFF" /> : null}
        </View>
        <Text variant="body" numberOfLines={1} style={s.dim}>{kind}{region ? <Text variant="body" weight="semibold" style={s.white}>{`  ·  ${region}`}</Text> : null}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { width: "100%", overflow: "hidden", backgroundColor: "#0B1A33", justifyContent: "flex-end" },
  topShade: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  bar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  btn: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  foot: { paddingHorizontal: 18, paddingBottom: 38, gap: 6, alignItems: "flex-start" },
  ok: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(34,197,94,0.18)", borderWidth: 1, borderColor: "rgba(74,222,128,0.55)" },
  okTx: { color: "#BBF7D0" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flexShrink: 1, color: "#FFFFFF", fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  dim: { color: "rgba(255,255,255,0.75)" },
  white: { color: "#FFFFFF" },
});
