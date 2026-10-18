import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AiOrb, GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

// LexGo AI on the dark gradient: the glowing orb, the title with a "Beta" chip, what it does, and a white button into the assistant.
export function AiCard({ i }: { i: number }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <Fade i={i}>
      <GradientBox variant="dark" style={s.card}>
        <View style={s.glow} pointerEvents="none" />
        <View style={s.row}>
          <AiOrb size={54} />
          <View style={s.txt}>
            <View style={s.head}><Text variant="h4" tone="white">{t("shm.dash.aiTitle")}</Text><View style={s.chip}><Text variant="caption" weight="bold" tone="white">{t("shm.dash.aiBeta")}</Text></View></View>
            <Text variant="small" style={s.sub}>{t("shm.dash.aiSub")}</Text>
          </View>
        </View>
        <PressableScale onPress={() => router.push("/(tabs)/ai" as never)} accessibilityRole="button" style={s.btn}>
          <Text variant="small" weight="bold" style={s.btnTx}>{t("shm.dash.aiCta")}</Text>
          <Icon name="arrow-right" size={16} color="#0B1F45" />
        </PressableScale>
      </GradientBox>
    </Fade>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 18 },
  glow: { position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.18)" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  txt: { flex: 1, gap: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  sub: { color: "#C4DEFF" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 23, backgroundColor: "#FFFFFF" },
  btnTx: { color: "#0B1F45" },
});
