import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { localDay, MessageBubble, relativeDay, serverIso, serverMs, type SupportMessage } from "@/entities/admin-support";
import { Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { messages: SupportMessage[]; meId: string; hasMore: boolean; loadingOlder: boolean; onOlder: () => void; onRetry: (m: SupportMessage) => void };
const GROUP_MS = 5 * 60_000;

// Messages newest first in an inverted list: the latest sits at the bottom, scrolling up loads older ones.
export function ChatList({ messages, meId, hasMore, loadingOlder, onOlder, onRetry }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const dayText = (iso: string) => {
    const rel = relativeDay(iso);
    return rel ? t(`admSup.${rel}`) : fmtDate(serverIso(iso), locale);
  };
  return (
    <FlatList
      inverted
      data={messages}
      keyExtractor={(m) => m.id || m.createdAt}
      keyboardShouldPersistTaps="handled"
      maintainVisibleContentPosition={{ minIndexForVisible: 1, autoscrollToTopThreshold: 120 }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.3}
      onEndReached={() => hasMore && onOlder()}
      ListFooterComponent={hasMore ? <View style={s.older}>{loadingOlder ? <ActivityIndicator color={c.accent} /> : <Text variant="caption" tone="gray">{t("admSup.loadOlder")}</Text>}</View> : null}
      renderItem={({ item, index }) => {
        const prev = messages[index + 1];
        const newDay = !prev || localDay(prev.createdAt) !== localDay(item.createdAt);
        const sys = item.messageType === "system";
        const compact = !!prev && !newDay && !sys && prev.messageType !== "system" && prev.senderUserId === item.senderUserId && serverMs(item.createdAt) - serverMs(prev.createdAt) < GROUP_MS;
        return (
          <View>
            {newDay && item.createdAt ? <Text variant="caption" tone="gray2" center style={s.day}>{dayText(item.createdAt)}</Text> : null}
            <MessageBubble m={item} mine={!!meId && item.senderUserId === meId} compact={compact} onRetry={() => onRetry(item)} />
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 16 },
  day: { marginVertical: 14 },
  older: { alignItems: "center", paddingVertical: 12 },
});
