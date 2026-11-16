import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowUp, Paperclip, Search } from "lucide-react-native";
import { PressableScale } from "@/shared/ui";
import { fonts, GLASS_SOLID, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { freshAiChat } from "@/features/ai-chat";
import { usePickForAnalysis } from "@/features/doc-analysis";

const RADIUS = 14;

// The problem field under the navy band (Adliya .j-ask): a white field with a hairline and a soft shadow. A question (the send button that
// replaces the clip once something is typed, or the keyboard's send) opens a new AI chat and asks it there (`?q=`); the paper clip picks a
// document and opens the AI document analysis with it (the AI chat takes text only).
export function DashAsk() {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const attach = usePickForAnalysis();
  const go = () => {
    freshAiChat(); // a question from Home starts its own conversation
    router.navigate({ pathname: "/(tabs)/ai", params: q.trim() ? { q: q.trim() } : {} });
    setQ(""); // asked: the field is empty again when Home comes back
  };
  const ground = glass ? GLASS_SOLID : dark ? c.surface : "#FFFFFF";
  return (
    <View style={[s.box, { backgroundColor: ground, borderColor: dark || glass ? c.line : "#E6EBF3" }]}>
      <Search size={18} color={c.gray} />
      <TextInput
        value={q}
        onChangeText={setQ}
        onSubmitEditing={go}
        submitBehavior="submit"
        returnKeyType="send"
        multiline
        numberOfLines={2}
        placeholder={t("cdash.home.title")}
        placeholderTextColor={c.gray}
        style={[s.input, { color: c.ink }]}
        accessibilityLabel={`${t("cdash.home.askPhLead")} ${t("cdash.home.askPhExample")}`}
      />
      {q.trim() ? (
        <PressableScale onPress={go} hitSlop={8} style={[s.btn, s.send, { backgroundColor: c.accent }]} accessibilityRole="button" accessibilityLabel={t("cdash.home.send")}>
          <ArrowUp size={18} color="#FFFFFF" />
        </PressableScale>
      ) : (
        <PressableScale onPress={() => void attach()} hitSlop={8} style={s.btn} accessibilityRole="button" accessibilityLabel={t("cdash.home.attach")}>
          <Paperclip size={18} color={c.gray} />
        </PressableScale>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 14, minHeight: 50, paddingLeft: 14, paddingRight: 6,
    borderRadius: RADIUS, borderWidth: 1, zIndex: 2,
    ...Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 2 } }),
  },
  btn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  send: { borderRadius: 12 },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, maxHeight: 64, paddingTop: 13, paddingBottom: 13, textAlignVertical: "center" },
});
