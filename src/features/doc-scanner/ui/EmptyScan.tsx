import { Linking, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useT } from "@/shared/i18n";
import { gradient } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";

// First screen: a big call to scan, with the gallery as the second way in.
export function EmptyScan({ onCamera, onGallery, denied }: { onCamera: () => void; onGallery: () => void; denied: boolean }) {
  const { t } = useT();
  return (
    <View style={s.root}>
      <LinearGradient colors={[...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}><Icon name="camera" size={44} tone="white" /></LinearGradient>
      <Text variant="h3" center>{t("scn.emptyT")}</Text>
      <Text tone="gray" center>{t("scn.emptyX")}</Text>
      {denied ? <><Text variant="small" center style={s.err}>{t("scn.noCam")}</Text><Button title={t("scn.settings")} icon="settings" variant="ghost" size="sm" onPress={() => void Linking.openSettings()} /></> : null}
      <View style={s.actions}>
        <Button title={t("scn.cam")} icon="camera" variant="gradient" full onPress={onCamera} />
        <Button title={t("scn.gal")} icon="image" variant="soft" full onPress={onGallery} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 28 },
  hero: { width: 112, height: 112, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actions: { alignSelf: "stretch", gap: 10, marginTop: 10 },
  err: { color: "#D92D20" },
});
