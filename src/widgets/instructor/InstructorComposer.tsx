import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Icon, PressableScale } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { sendToInstructor } from "@/features/instructor";

// Message field + round send button at the bottom of the sheet (the sheet itself rides above the keyboard).
export function InstructorComposer({ busy }: { busy: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const insets = useInsets();
  const [text, setText] = useState("");
  const can = !!text.trim() && !busy;
  const submit = () => {
    if (!can) return;
    void sendToInstructor(text, locale);
    setText("");
  };
  return (
    <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
      <View style={[s.field, { backgroundColor: c.surface2, borderColor: c.line }]}>
        <TextInput value={text} onChangeText={setText} placeholder={t("ax2.placeholder")} placeholderTextColor={c.gray2} multiline maxLength={1000} returnKeyType="send" blurOnSubmit style={[s.input, { color: c.ink }]} onSubmitEditing={submit} />
      </View>
      <PressableScale onPress={submit} disabled={!can} accessibilityRole="button" accessibilityLabel={t("ax2.send")} style={[s.send, { backgroundColor: can ? c.accent : c.line }]}>
        <Icon name="arrow-up" size={20} color="#FFFFFF" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  field: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, justifyContent: "center" },
  input: { fontFamily: "Inter_400Regular", fontSize: 15, paddingVertical: 10 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
