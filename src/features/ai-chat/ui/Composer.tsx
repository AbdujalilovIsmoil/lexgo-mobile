import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useAiTheme } from "@/shared/theme";
import { SendButton } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useInstructorPrefill, useInstructorTarget } from "@/shared/instructor";
import { PiiNote } from "./PiiNote";
import { RunningEdge } from "./RunningEdge";

type Props = { onSend: (text: string) => void; disabled?: boolean; sending?: boolean };

// Bottom bar docked edge to edge, a hairline on top: one rounded field with the round send button inside it on the right and a
// violet-to-cyan light running along its lower edge (RunningEdge), and the short privacy line under it. The safe-area gap shrinks smoothly while the keyboard is open.
export function Composer({ onSend, disabled, sending }: Props) {
  const { t } = useT();
  const aiTheme = useAiTheme();
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
    <Animated.View style={[s.bar, { backgroundColor: aiTheme.bar, borderTopColor: aiTheme.border }, pad]}>
      <View {...mark} style={[s.field, { borderColor: focused ? aiTheme.accent : aiTheme.border, backgroundColor: aiTheme.card }]}>
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
          style={[s.input, { color: aiTheme.text }]}
        />
        <SendButton enabled={can} onPress={submit} size={46} label={t("ai.inputPlaceholder")} idle={aiTheme.dark ? "rgba(47,107,255,0.55)" : "rgba(22,104,240,0.45)"} />
        <RunningEdge />
      </View>
      <PiiNote />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { paddingHorizontal: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  field: { flexDirection: "row", alignItems: "flex-end", gap: 8, minHeight: 58, maxHeight: 150, borderRadius: 29, borderWidth: 1.5, paddingLeft: 18, paddingRight: 5, paddingVertical: 5 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 21, paddingVertical: 11, alignSelf: "center" },
});
