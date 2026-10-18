import { StyleSheet, TextInput, View } from "react-native";
import { Icon, IconButton, PressableScale } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

type Props = { text: string; onChange: (v: string) => void; onSend: () => void; onAttach: () => void; onEmoji: () => void; onMic: () => void };

// The everyday composer row: attach, multi-line text with the emoji button inside, and send (or the mic while empty).
export function TextBar({ text, onChange, onSend, onAttach, onEmoji, onMic }: Props) {
  const { t } = useT();
  const c = useColors();
  const ready = !!text.trim();
  return (
    <View style={s.row}>
      <IconButton icon="paperclip" onPress={onAttach} label={t("admChat.attach")} />
      <View style={[s.field, { backgroundColor: c.surface2 }]}>
        <Icon name="lock" size={16} color={c.gray2} />
        <TextInput value={text} onChangeText={onChange} multiline accessibilityLabel={t("admChat.placeholder")} placeholder={t("admChat.placeholder")} placeholderTextColor={c.gray2} style={[s.input, { color: c.ink }]} />
        <PressableScale onPress={onEmoji} haptic={false} hitSlop={8} accessibilityLabel={t("ms3.emoji")}><Icon name="smile" size={22} tone="gray" /></PressableScale>
      </View>
      <PressableScale onPress={ready ? onSend : onMic} accessibilityLabel={ready ? t("ms3.send") : t("ms3.voice")} style={[s.btn, { backgroundColor: c.accent }]}>
        <Icon name={ready ? "arrow-up" : "mic"} size={22} color="#FFFFFF" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 22, paddingHorizontal: 14, minHeight: 44 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, maxHeight: 120, paddingVertical: 10 },
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
