import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SosRadar } from "./SosRadar";

// Emergency header: a beacon sending red waves, then the title and the one-line promise.
export function SosHero() {
  const { t } = useT();
  return (
    <LinearGradient colors={["#2A0A14", "#6E0F2B", "#C2123F"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.box}>
      <SosRadar />
      <Text variant="h2" tone="white" center>{t("cxSos.title")}</Text>
      <Text variant="small" center style={s.sub}>{t("cxSos.subtitle")}</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: radius.rx, paddingVertical: 24, paddingHorizontal: 20, gap: 8, alignItems: "center", overflow: "hidden" },
  sub: { color: "rgba(255,255,255,0.85)" },
});
