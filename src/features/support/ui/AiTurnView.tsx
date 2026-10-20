import { StyleSheet, View } from "react-native";
import { Button, Icon, MarkdownText, Skeleton, Text } from "@/shared/ui";
import { brand, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { AiTurn } from "../model/aiStore";

type Props = { turn: AiTurn; onRetry: () => void; onOpen: (path: string) => void };

// One question to the support AI and its answer: text, steps, and the screen it points to.
export function AiTurnView({ turn, onRetry, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.wrap}>
      <View style={[s.q, { backgroundColor: brand.b600 }]}><Text variant="body" tone="white">{turn.q}</Text></View>
      <View style={[s.a, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <View style={s.kick}><Icon name="zap" size={13} color={c.accent} /><Text variant="caption" weight="bold" tone="accent">{t("sp5.kicker")}</Text></View>
        {turn.state === "pending" ? <View style={{ gap: 8 }}><Skeleton height={14} /><Skeleton height={14} width="70%" /></View> : null}
        {turn.state === "failed" ? <Button title={t("sp5.retry")} variant="soft" size="sm" icon="refresh-cw" onPress={onRetry} /> : null}
        {turn.state === "done" ? (
          <>
            {turn.a ? <MarkdownText text={turn.a} color={c.ink} linkColor={c.accent} mutedColor={c.gray} /> : <Text variant="body" tone="gray">{t("sp5.noAnswer")}</Text>}
            {turn.steps.map((step, i) => (
              <View key={i} style={s.step}>
                <Text variant="small" weight="bold" tone="accent">{i + 1}.</Text>
                <Text variant="small" style={s.stepText}>{step}</Text>
              </View>
            ))}
            {turn.target ? <Button title={t("sp5.open", { name: t(`sp5.routes.${turn.target.key}`) })} variant="soft" size="sm" icon="arrow-right" iconRight onPress={() => onOpen(turn.target!.path)} /> : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  q: { alignSelf: "flex-end", maxWidth: "86%", borderRadius: 18, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 },
  a: { alignSelf: "flex-start", maxWidth: "94%", borderRadius: 18, borderBottomLeftRadius: 6, borderWidth: 1, padding: 14, gap: 10 },
  kick: { flexDirection: "row", alignItems: "center", gap: 6 },
  step: { flexDirection: "row", gap: 8 },
  stepText: { flex: 1 },
});
