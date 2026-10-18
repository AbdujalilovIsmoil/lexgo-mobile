import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { localDay, MessageBubble, relativeDay, serverIso, serverMs, type AssistInfo, type SupportAttachment, type SupportCall, type SupportMessage } from "@/entities/support";
import { AssistNote } from "./AssistNote";
import { CallRow } from "./CallRow";
import type { ChatRow } from "./chatRows";

type Props = {
  meta?: string; rows: ChatRow[]; meId: string; hasMore: boolean; loadingOlder: boolean; onOlder: () => void;
  on: { retry: (m: SupportMessage) => void; file: (a: SupportAttachment) => void; card: (c: AssistInfo) => void; join: (c: SupportCall) => void; dismiss: () => void };
};
const GROUP_MS = 5 * 60_000;
const dayOf = (r: ChatRow | undefined) => (r && r.k !== "c" && r.at ? localDay(r.at) : "");

// Newest first in an inverted list: the latest sits at the bottom, scrolling up loads older messages.
export function ChatList({ meta, rows, meId, hasMore, loadingOlder, onOlder, on }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const dayText = (iso: string) => {
    const rel = relativeDay(iso);
    return rel ? t(`sp3.${rel}`) : fmtDate(serverIso(iso), locale);
  };
  return (
    <FlatList
      inverted
      data={rows}
      keyExtractor={(r) => r.id}
      keyboardShouldPersistTaps="handled"
      maintainVisibleContentPosition={{ minIndexForVisible: 1, autoscrollToTopThreshold: 120 }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.3}
      onEndReached={() => hasMore && onOlder()}
      ListFooterComponent={hasMore ? <View style={s.older}>{loadingOlder ? <ActivityIndicator color={c.accent} /> : <Text variant="caption" tone="gray">{t("sp3.loadOlder")}</Text>}</View> : meta ? <Text variant="caption" tone="gray2" center style={s.day}>{meta}</Text> : null}
      renderItem={({ item, index }) => {
        if (item.k === "c") return <CallRow call={item.call} onJoin={() => on.join(item.call)} onDismiss={on.dismiss} />;
        const prev = rows[index + 1];
        const head = item.at && dayOf(prev) !== dayOf(item) ? <Text variant="caption" tone="gray2" center style={s.day}>{dayText(item.at)}</Text> : null;
        if (item.k === "a") return <View>{head}<AssistNote card={item.card} onPress={() => on.card(item.card)} /></View>;
        const m = item.m;
        const before = prev?.k === "m" ? prev.m : undefined;
        const compact = !!before && !head && m.messageType !== "system" && before.messageType !== "system" && before.senderUserId === m.senderUserId && serverMs(m.createdAt) - serverMs(before.createdAt) < GROUP_MS;
        return <View>{head}<MessageBubble m={m} mine={!!meId && m.senderUserId === meId} compact={compact} onRetry={() => on.retry(m)} onFile={on.file} /></View>;
      }}
    />
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 16 },
  day: { marginVertical: 14 },
  older: { alignItems: "center", paddingVertical: 12 },
});
