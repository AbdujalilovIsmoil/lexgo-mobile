import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { aiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtTime } from "@/shared/lib/format";
import type { ChatMessage } from "../model/types";
import { ContractCard } from "./ContractCard";
import { AiMarkdown } from "./markdown/AiMarkdown";
import type { Agent } from "./markdown/AgentFoot";
import { SourceChips } from "./SourceChips";

type Props = { message: ChatMessage; footer?: ReactNode; onRetry?: () => void; agent?: Agent };

// User: brand-gradient bubble on the right. Assistant: glass card on the left, markdown body,
// sources, contract files and a footer slot (copy / share / feedback live in the feature layer).
export function MessageBubble({ message, footer, onRetry, agent }: Props) {
  const { t } = useT();
  const mine = message.role === "user";
  const time = message.createdAt ? fmtTime(message.createdAt) : "";
  const inner = (
    <>
      {mine ? (
        <Text variant="body" tone="white" selectable>{message.content}</Text>
      ) : (
        <AiMarkdown text={message.content} color={aiTheme.text} linkColor={aiTheme.accent} mutedColor={aiTheme.muted} agent={agent} />
      )}
      {!mine && message.sources?.length ? <SourceChips sources={message.sources} /> : null}
      {!mine ? message.contracts?.map((c, i) => <ContractCard key={c.id || i} contract={c} />) : null}
      {time ? <Text variant="caption" style={[s.time, { color: mine ? "rgba(255,255,255,0.7)" : aiTheme.muted }]}>{time}</Text> : null}
    </>
  );
  return (
    <Animated.View entering={FadeInUp.duration(240)} style={[s.row, mine ? s.right : s.left]}>
      <View style={mine ? s.mineCol : s.theirsCol}>
        {mine ? (
          <LinearGradient colors={[...aiTheme.user]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.bubble, s.mine, message.pending && s.pending, message.failed && s.failed]}>
            {inner}
          </LinearGradient>
        ) : (
          <View style={[s.bubble, s.theirs]}>{inner}</View>
        )}
        {mine && message.failed && onRetry ? (
          <PressableScale onPress={onRetry} style={s.retry} accessibilityRole="button">
            <Icon name="refresh-cw" size={13} color="#FF9494" />
            <Text variant="caption" weight="semibold" style={{ color: "#FF9494" }}>{t("ax1.retry")}</Text>
          </PressableScale>
        ) : null}
        {footer}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 5 },
  left: { justifyContent: "flex-start", paddingRight: 28 },
  right: { justifyContent: "flex-end", paddingLeft: 56 },
  mineCol: { alignItems: "flex-end", maxWidth: "100%" },
  theirsCol: { alignItems: "flex-start", maxWidth: "100%", flexShrink: 1 },
  bubble: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 22, gap: 6, maxWidth: "100%" },
  mine: { borderBottomRightRadius: 7 },
  theirs: { backgroundColor: aiTheme.glass, borderWidth: 1, borderColor: aiTheme.border, borderBottomLeftRadius: 7 },
  pending: { opacity: 0.7 },
  failed: { borderWidth: 1.5, borderColor: "#FF9494" },
  time: { alignSelf: "flex-end" },
  retry: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 4 },
});
