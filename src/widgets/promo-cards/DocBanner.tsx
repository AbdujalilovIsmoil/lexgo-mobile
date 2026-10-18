import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, GradientBox, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Home shortcut to the AI document analysis (upload a file, get risks back).
export function DocBanner() {
  const { t } = useT();
  const router = useRouter();
  return (
    <GradientBox variant="dark" style={s.box}>
      <View style={s.mark}><Icon name="file-text" size={110} color="rgba(255,255,255,0.08)" /></View>
      <View style={s.icon}><Icon name="upload-cloud" size={22} tone="white" /></View>
      <Text variant="h3" tone="white">{t("home.docTitle")}</Text>
      <Text variant="small" style={s.sub}>{t("home.docSub")}</Text>
      <Button title={t("home.docCta")} onPress={() => router.push("/doc-analysis")} variant="gradient" icon="upload" style={s.btn} />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { marginHorizontal: 16, marginTop: 20, padding: 20, gap: 8 },
  mark: { position: "absolute", right: -10, top: -10 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  sub: { color: "#C4DEFF" },
  btn: { marginTop: 8 },
});
