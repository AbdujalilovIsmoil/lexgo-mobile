import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { sendToInstructor, type InstructorMsg } from "@/features/instructor";
import { CommandChips } from "./CommandChips";
import { ReplyExtras } from "./ReplyExtras";

type Props = { msg: InstructorMsg; last: boolean };

// A user bubble (tap a failed one to send it again) or an assistant card with what it did and can do next.
export function Bubble({ msg, last }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  if (msg.role === "user") {
    return (
      <View style={s.mine}>
        <View style={[s.bubble, { backgroundColor: c.accent }, msg.failed && { borderColor: c.err, borderWidth: 1.5 }]}>
          <Text variant="small" tone="white" selectable>{msg.text}</Text>
        </View>
        {msg.failed ? (
          <PressableScale onPress={() => void sendToInstructor(msg.text, locale)} style={s.retry} accessibilityRole="button">
            <Icon name="refresh-cw" size={13} color={c.err} />
            <Text variant="caption" weight="semibold" style={{ color: c.err }}>{t("ax2.retry")}</Text>
          </PressableScale>
        ) : null}
      </View>
    );
  }
  return (
    <View style={[s.card, { backgroundColor: c.surface2, borderColor: c.line }]}>
      <Text variant="small" selectable>{msg.text}</Text>
      {msg.reply ? <CommandChips commands={msg.reply.commands} /> : null}
      {msg.reply ? <ReplyExtras reply={msg.reply} last={last} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  mine: { alignItems: "flex-end", gap: 4 },
  bubble: { maxWidth: "86%", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, borderBottomRightRadius: 5 },
  retry: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 4 },
  card: { alignSelf: "flex-start", maxWidth: "94%", gap: 10, padding: 14, borderRadius: 18, borderBottomLeftRadius: 5, borderWidth: 1 },
});
