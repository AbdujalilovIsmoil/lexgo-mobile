import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { aiTheme } from "@/shared/theme";
import { SendButton } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useInstructorPrefill, useInstructorTarget } from "@/shared/instructor";

type Props = { onSend: (text: string) => void; disabled?: boolean; sending?: boolean };

// Bottom bar docked edge to edge. Its background reaches the screen bottom;
// the safe-area gap shrinks smoothly while the keyboard is open.
export function Composer({ onSend, disabled, sending }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const can = !!text.trim() && !disabled && !sending;
  const input = useRef<TextInput>(null);
  const mark = useInstructorTarget("ai-chat:input", { label: t("ai.inputPlaceholder"), type: "input", onFocus: () => input.current?.focus() });
  const pad = useAnimatedStyle(() => ({ paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom + 10, 10]) }));
  useInstructorPrefill("ai-chat:input", setText, { label: t("ai.inputPlaceholder") });
  const submit = () => {
    if (!can) return;
    onSend(text);
    setText("");
  };
  return (
    <Animated.View style={[s.bar, pad]}>
      <View {...mark} style={[s.field, focused && s.focused]}>
        <TextInput
          ref={input}
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={t("ai.inputPlaceholder")}
          placeholder={t("ai.inputPlaceholder")}
          placeholderTextColor={aiTheme.muted}
          selectionColor={aiTheme.accent}
          multiline
          maxLength={2000}
          editable={!disabled}
          style={s.input}
        />
      </View>
      <SendButton enabled={can} onPress={submit} size={46} label={t("ai.inputPlaceholder")} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 10, backgroundColor: aiTheme.bar, borderTopWidth: 1, borderTopColor: aiTheme.border },
  field: { flex: 1, minHeight: 46, maxHeight: 140, justifyContent: "center", borderRadius: 24, borderWidth: 1.5, borderColor: aiTheme.border, backgroundColor: aiTheme.glass, paddingHorizontal: 16 },
  focused: { borderColor: aiTheme.accent },
  input: { color: aiTheme.text, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 20, paddingVertical: 10 },
});
