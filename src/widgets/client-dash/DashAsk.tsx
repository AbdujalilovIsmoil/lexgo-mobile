import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Icon, PressableScale, singleLineText } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { HERO_OVERLAP } from "./DashHero";

// The problem field on the hero's bottom edge: Enter opens the AI page with `?q=`; the paper clip opens the document analysis.
export function DashAsk() {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const go = () => router.navigate({ pathname: "/(tabs)/ai", params: q.trim() ? { q: q.trim() } : {} });
  return (
    <View style={[s.box, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#BFE0FF" }]}>
      <Ionicons name="sparkles" size={18} color="#2F6BFF" />
      <TextInput value={q} onChangeText={setQ} onSubmitEditing={go} returnKeyType="send" placeholder={t("cdash.home.askPh")} placeholderTextColor={c.gray2} style={[s.input, { color: c.ink }, singleLineText]} accessibilityLabel={t("cdash.home.askPh")} />
      <PressableScale onPress={() => router.push("/doc-analysis")} hitSlop={8} style={s.clip} accessibilityRole="button" accessibilityLabel={t("cdash.home.attach")}>
        <Icon name="paperclip" size={20} tone="gray" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 2, borderRadius: 20, paddingLeft: 18, paddingRight: 8, minHeight: 56,
    marginHorizontal: 16, marginTop: -HERO_OVERLAP, zIndex: 2,
    ...Platform.select({ ios: { shadowColor: "#2F6BFF", shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }, default: { elevation: 6 } }),
  },
  clip: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 10 },
});
