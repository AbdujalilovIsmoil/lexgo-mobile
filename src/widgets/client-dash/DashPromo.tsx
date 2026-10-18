import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, IconButton, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const KEY = "lexgo_lawyer_promo_hidden";
const HIDE_MS = 3 * 24 * 60 * 60 * 1000;
const DELAY_MS = 2200;
const remember = () => AsyncStorage.setItem(KEY, String(Date.now())).catch(() => {});

// LawyerPromo: appears 2.2 s after opening, hides for 3 days once closed or tapped (same rule as the web).
// A fixed-height gradient banner: text on the left, the lawyers picture bleeding off the bottom-right.
export function DashPromo() {
  const { t } = useT();
  const router = useRouter();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    AsyncStorage.getItem(KEY).then((v) => {
      const at = Number(v || 0);
      if (!(at > 0 && Date.now() - at < HIDE_MS)) id = setTimeout(() => setShow(true), DELAY_MS);
    }).catch(() => {});
    return () => clearTimeout(id);
  }, []);
  if (!show) return null;
  const close = () => { void remember(); setShow(false); };
  const open = () => { void remember(); router.navigate("/(tabs)/lawyers"); };
  return (
    <Animated.View entering={FadeInDown.duration(420)} exiting={FadeOutUp.duration(260)} style={s.outer}>
      <LinearGradient colors={["#0B1F45", "#123A86", "#0E7FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <Image source={require("../../../assets/dash/advokat-yuristlar-promo.webp")} style={s.art} />
        <PressableScale onPress={open} scale={0.99} style={s.copy} accessibilityRole="button" accessibilityLabel={t("cdash.lawyerAdTitle")}>
          <View style={s.tag}><Icon name="star" size={12} color="#00CFE8" /><Text variant="caption" weight="bold" style={s.tagTx}>{t("cdash.lawyerAdEyebrow")}</Text></View>
          <Text variant="h4" tone="white" numberOfLines={2}>{t("cdash.lawyerAdTitle")}</Text>
          <Text variant="small" numberOfLines={3} style={s.txt}>{t("cdash.lawyerAdText")}</Text>
          <View style={s.cta}><Text variant="small" weight="bold" style={s.ctaTx}>{t("cdash.lawyerAdCta")}</Text><Icon name="arrow-right" size={15} color="#0B1F45" /></View>
        </PressableScale>
        <View style={s.x}><IconButton icon="x" size={28} tone="glass" label={t("cdash.lawyerAdClose")} onPress={close} /></View>
      </LinearGradient>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  outer: { marginHorizontal: 16, marginTop: 16 },
  card: { borderRadius: 22, minHeight: 190, overflow: "hidden" },
  art: { position: "absolute", right: -22, bottom: -22, width: 150, height: 150, opacity: 0.95 },
  copy: { padding: 18, paddingRight: 130, gap: 6, alignItems: "flex-start" },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagTx: { color: "#CFE9FF" },
  txt: { color: "#C4DEFF" },
  cta: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginTop: 6 },
  ctaTx: { color: "#0B1F45" },
  x: { position: "absolute", top: 10, right: 10 },
});
