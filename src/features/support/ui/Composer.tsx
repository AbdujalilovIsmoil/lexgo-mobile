import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { SendResult } from "../model/useTicketChat";

type Props = { onSend: (text: string) => Promise<SendResult>; blocked: string | null };

// Message box docked above the keyboard. The text clears at once (the message shows as "sending")
// and comes back when the backend refuses it (contact details and links are not allowed).
export function Composer({ onSend, blocked }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const [text, setText] = useState("");
  const can = text.trim().length > 0;
  const pad = useAnimatedStyle(() => ({ paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom + 10, 10]) }));
  const submit = () => {
    if (!can) return;
    const body = text;
    setText("");
    void onSend(body).then((r) => r === "blocked" && setText(body));
  };
  return (
    <Animated.View style={[s.bar, { backgroundColor: c.bg, borderTopColor: c.line }, pad]}>
      {blocked !== null ? <Text variant="caption" tone="err" style={s.note}>{blocked || t("sp3.contactBlocked")}</Text> : null}
      <View style={s.row}>
        <TextInput value={text} onChangeText={setText} accessibilityLabel={t("sp3.ph")} placeholder={t("sp3.ph")} placeholderTextColor={c.gray2} multiline maxLength={4000} style={[s.input, { color: c.ink, backgroundColor: c.surface2, borderColor: c.line }]} />
        <PressableScale onPress={submit} disabled={!can} accessibilityLabel={t("sp3.send")} style={[s.send, { backgroundColor: can ? brand.b600 : c.surface2 }]}>
          <Icon name="arrow-up" size={22} color={can ? "#FFFFFF" : c.gray2} />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, gap: 6 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  note: { marginLeft: 6 },
  input: { flex: 1, minHeight: 46, maxHeight: 140, borderRadius: 23, borderWidth: 1.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 20 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
});
