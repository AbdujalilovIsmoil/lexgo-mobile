import { StyleSheet, View } from "react-native";
import type { ChatReply } from "@/entities/instructor";
import { Button, Card, Chip, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { canReplay, offersSupport, replayReply, sendToInstructor, startSupportHandoff } from "@/features/instructor";

// Below an answer: steps, what is still needed, "show again", follow-up questions and the operator offer.
export function ReplyExtras({ reply, last }: { reply: ChatReply; last: boolean }) {
  const { t, locale } = useT();
  const steps = [...reply.steps, ...reply.commands.flatMap((c) => (c.type === "show_steps" ? c.steps : []))];
  return (
    <View style={s.col}>
      {steps.length ? (
        <View style={s.col}>
          <Text variant="caption" tone="gray" weight="semibold">{t("ax2.steps")}</Text>
          {steps.map((x, i) => <Text key={i} variant="small">{i + 1}. {x}</Text>)}
        </View>
      ) : null}
      {reply.missing.length ? (
        <View style={s.col}>
          <Text variant="caption" tone="gray" weight="semibold">{t("ax2.missing")}</Text>
          {reply.missing.map((x, i) => <Text key={i} variant="small">• {x}</Text>)}
        </View>
      ) : null}
      {canReplay(reply) ? <Button title={t("ax2.showAgain")} icon="refresh-cw" variant="soft" size="sm" onPress={() => replayReply(reply)} /> : null}
      {last && reply.suggestions.length ? (
        <View style={s.row}>{reply.suggestions.map((q) => <Chip key={q} label={q} onPress={() => void sendToInstructor(q, locale)} />)}</View>
      ) : null}
      {last && offersSupport(reply) ? (
        <Card>
          <View style={s.col}>
            <Text variant="small" weight="semibold">{t("ax2.supportTitle")}</Text>
            <Text variant="caption" tone="gray">{reply.support.reason || t("ax2.supportText")}</Text>
            <Button title={t("ax2.supportBtn")} icon="headphones" size="sm" onPress={startSupportHandoff} />
          </View>
        </Card>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
