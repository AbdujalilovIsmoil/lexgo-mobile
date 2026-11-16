import { Share, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft, Share as ShareIcon } from "lucide-react-native";
import { FocusStatusBar, PressableScale } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Adliya .sp-cover: the 135° navy → blue → navy band at the top of a specialist's page (square bottom edge — the avatar sits on it), with the
// glass back and share buttons. Share sends the public web page (lexgo.uz/<locale>/lawyers/<id>), which opens this page in the app.
export function SpecialistCover({ userId }: { userId: string }) {
  const insets = useInsets();
  const router = useRouter();
  const { t, locale } = useT();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const share = () => { void Share.share({ message: `https://lexgo.uz/${locale}/lawyers/${encodeURIComponent(userId)}` }).catch(() => undefined); };
  return (
    <View style={[s.cover, { height: insets.top + 120 }]}>
      <LinearGradient colors={["#13357A", "#2456C2", "#0A1F44"]} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <FocusStatusBar style="light" />
      <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
        <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.icon.chevron-left")} style={s.btn}>
          <ChevronLeft size={22} color="#FFFFFF" />
        </PressableScale>
        <PressableScale onPress={share} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.icon.share")} style={s.btn}>
          <ShareIcon size={19} color="#FFFFFF" />
        </PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cover: { overflow: "hidden" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  btn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
});
