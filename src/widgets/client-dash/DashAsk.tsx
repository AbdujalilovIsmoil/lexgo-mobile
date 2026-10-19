import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, singleLineText } from "@/shared/ui";
import { gradient } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// .cdhero__ask: the problem field; Enter / the round button opens the AI page with `?q=`.
export function DashAsk() {
  const { t } = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const go = () => router.navigate({ pathname: "/(tabs)/ai", params: q.trim() ? { q: q.trim() } : {} });
  return (
    <View style={s.box}>
      <Icon name="star" size={20} color="#00CFE8" />
      <TextInput value={q} onChangeText={setQ} onSubmitEditing={go} returnKeyType="send" placeholder={t("cdash.askPh")} placeholderTextColor="#9FB4D4" style={[s.input, singleLineText]} accessibilityLabel={t("cdash.askPh")} />
      <PressableScale onPress={go} accessibilityRole="button" accessibilityLabel={t("cdash.askBtn")}>
        <LinearGradient colors={gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.send}>
          <Icon name="send" size={19} tone="white" />
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, marginTop: 6 },
  input: { flex: 1, minWidth: 0, color: "#FFFFFF", fontSize: 15, paddingVertical: 10 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
});
