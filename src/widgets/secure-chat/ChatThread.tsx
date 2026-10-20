import { useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { MessageBubble, type Msg, type OpenFile } from "@/entities/secure-chat";
import type { LoadState } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { SecureNote } from "./SecureNote";
import { buildItems, itemKey } from "./threadItems";
import { useJump } from "./useJump";

type Props = {
  msgs: Msg[]; state: LoadState; error: unknown; myId: string; group: boolean; divider: string; hasOlder: boolean; liveCalls?: Set<string>;
  onOlder: () => void; onReveal: (id: string) => void; onMenu: (m: Msg) => void; onReply: (m: Msg) => void; onCall: (callId: string) => void; onOpen: (f: OpenFile) => void; onRetry: () => void;
};

// The conversation: an inverted list (newest at the bottom, stays pinned there), day labels, an "N new messages"
// divider, older messages revealed while scrolling up, skeleton / error / empty states and jump-to-quote.
export function ChatThread(p: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const items = useMemo(() => buildItems(p.msgs, t, locale, p.divider), [p.msgs, t, locale, p.divider]);
  const { ref, flash, jump } = useJump(items, p.onReveal);
  if (p.state === "loading") return <View style={s.pad}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={52} round={18} style={{ width: i % 2 ? "62%" : "74%", alignSelf: i % 2 ? "flex-end" : "flex-start" }} />)}</View>;
  if (p.state === "error" && !p.msgs.length) return <ErrorView error={p.error} onRetry={p.onRetry} />;
  if (!p.msgs.length) return <EmptyState icon="shield" title={t("admChat.emptyRoom")} text={t("admChat.emptyRoomText")} />;
  return (
    <>
    <SecureNote text={t("scx.encrypted")} />
    <FlatList
      ref={ref}
      inverted
      data={items}
      keyExtractor={itemKey}
      renderItem={({ item }) => item.kind === "day" ? <View style={[s.day, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}><Text variant="caption" weight="semibold" tone="gray">{item.label}</Text></View>
        : item.kind === "new" ? <View style={[s.new, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent" center>{t("ms4.newMessages", { n: item.n })}</Text></View>
        : <MessageBubble msg={item.msg} mine={item.msg.senderId === p.myId} group={p.group} flash={flash === item.msg.id} canReply={!item.msg.pending && !item.msg.failed && !item.msg.id.startsWith("tmp-")} live={p.liveCalls} onMenu={p.onMenu} onReply={p.onReply} onCall={p.onCall} onJump={jump} onOpen={p.onOpen} />}
      onEndReached={() => p.hasOlder && p.onOlder()}
      onEndReachedThreshold={0.4}
      ListFooterComponent={p.hasOlder ? <ActivityIndicator style={s.more} color={c.accent} /> : null}
      onScrollToIndexFailed={(e) => ref.current?.scrollToOffset({ offset: e.averageItemLength * e.index, animated: true })}
      contentContainerStyle={s.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    />
    </>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 16 },
  pad: { padding: 14, gap: 12, flex: 1 },
  day: { alignSelf: "center", marginVertical: 14, paddingHorizontal: 14, height: 28, borderRadius: 14, borderWidth: 1, justifyContent: "center" },
  new: { alignSelf: "center", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, marginVertical: 12 },
  more: { padding: 14 },
});
