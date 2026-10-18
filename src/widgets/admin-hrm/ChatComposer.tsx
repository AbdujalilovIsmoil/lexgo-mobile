import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Icon, PressableScale } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Message field + round send button at the bottom of the chat (the screen rides above the keyboard).
export function ChatComposer({ busy, onSend }: { busy: boolean; onSend: (text: string) => void }) {
  const c = useColors();
  const { t } = useT();
  const insets = useInsets();
  const [text, setText] = useState("");
  const can = !!text.trim() && !busy;
  const submit = () => { if (!can) return; onSend(text.trim()); setText(""); };
  return (
    <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
      <View style={[s.field, { backgroundColor: c.surface2, borderColor: c.line }]}>
        <TextInput value={text} onChangeText={setText} accessibilityLabel={t("admHrmV.chatPh")} placeholder={t("admHrmV.chatPh")} placeholderTextColor={c.gray2} multiline maxLength={4000} style={[s.input, { color: c.ink }]} />
      </View>
      <PressableScale onPress={submit} disabled={!can} accessibilityRole="button" accessibilityLabel={t("admHrm.send")} style={[s.send, { backgroundColor: can ? c.accent : c.line }]}>
        <Icon name="arrow-up" size={20} color="#FFFFFF" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  field: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, justifyContent: "center" },
  input: { fontFamily: "Inter_400Regular", fontSize: 15, paddingVertical: 10 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
