import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Steps } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The four-step warranty timeline (from the LexGo Warranty page) + ask-AI action.
export function GuaranteeStat({ go }: { go: (fn: () => void) => void }) {
  const { t, tList } = useT();
  const router = useRouter();
  return (
    <View style={s.col}>
      <Steps steps={tList<{ title: string; text: string }>("stats.response.steps")} />
      <Button title={t("stats.response.cta")} onPress={() => go(() => router.navigate("/(tabs)/ai"))} variant="gradient" icon="zap" full />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
});
