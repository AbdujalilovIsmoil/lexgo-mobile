import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, FileText, Sparkles } from "lucide-react-native";
import { AiOrb, GradientBox, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

// LexGo AI on the dark gradient: the glowing orb, the title with a "Beta" chip, what it does, a compact white button into the assistant —
// the case tool for an advokat (/pro/assistant), the AI chat for a yurist, as on the web dashboard — and two documents with a spark drawn
// faintly on the right.
export function AiCard({ i, advocate }: { i: number; advocate: boolean }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <Fade i={i}>
      <GradientBox variant="dark" style={s.card}>
        <View style={s.glow} pointerEvents="none" />
        <View style={s.art} pointerEvents="none">
          <View style={[s.doc, s.docBack]}><FileText size={64} color="rgba(255,255,255,0.35)" strokeWidth={1.2} /></View>
          <View style={[s.doc, s.docFront]}><FileText size={74} color="rgba(255,255,255,0.75)" strokeWidth={1.2} /></View>
          <Sparkles size={26} color="#FFFFFF" style={s.spark} />
        </View>
        <View style={s.row}>
          <AiOrb size={54} />
          <View style={s.txt}>
            <View style={s.head}><Text variant="h4" tone="white">{t("shm.dash.aiTitle")}</Text><View style={s.chip}><Text variant="caption" weight="bold" tone="white">{t("shm.dash.aiBeta")}</Text></View></View>
            <Text variant="small" style={s.sub}>{t("shm.dash.aiSub")}</Text>
          </View>
        </View>
        <PressableScale onPress={() => router.push((advocate ? "/pro/assistant" : "/(tabs)/ai") as never)} accessibilityRole="button" style={s.btn}>
          <Text variant="small" weight="bold" style={s.btnTx}>{t("shm.dash.aiCta")}</Text>
          <ArrowRight size={16} color="#0B1F45" strokeWidth={2.4} />
        </PressableScale>
      </GradientBox>
    </Fade>
  );
}

const s = StyleSheet.create({
  card: { gap: 16, padding: 18, overflow: "hidden" },
  glow: { position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.18)" },
  art: { position: "absolute", right: 6, bottom: 4, width: 120, height: 120 },
  doc: { position: "absolute" },
  docBack: { left: 4, bottom: 6, transform: [{ rotate: "-14deg" }] },
  docFront: { right: 8, bottom: 14, transform: [{ rotate: "10deg" }] },
  spark: { position: "absolute", right: 0, top: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingRight: 70 },
  txt: { flex: 1, gap: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  sub: { color: "#C4DEFF" },
  btn: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, paddingHorizontal: 24, borderRadius: 23, backgroundColor: "#FFFFFF" },
  btnTx: { color: "#0B1F45" },
});
