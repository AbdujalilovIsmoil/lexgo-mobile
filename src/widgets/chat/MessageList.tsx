import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MessageBubble, type ChatLimit, type ChatMessage, type GuestLimit } from "@/entities/chat";
import { LimitCard, LimitHint, MessageActions } from "@/features/ai-chat";
import { AiWelcome } from "./AiWelcome";
import { agentFor } from "./agentProps";
import { Thinking } from "./Thinking";

type Props = {
  messages: ChatMessage[];
  sending: boolean;
  limitErr: ChatLimit | null;
  limit: GuestLimit | null;
  onPick: (text: string) => void;
  onRetry: (id: string) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
};

// Welcome screen while empty, then the conversation. A fresh answer scrolls to its first line
// (long legal answers are read from the top); a sent question scrolls to the end.
export function MessageList({ messages, sending, limitErr, limit, onPick, onRetry, onLike, onDislike }: Props) {
  const ref = useRef<FlatList<ChatMessage>>(null);
  const empty = messages.length === 0;
  const last = messages[messages.length - 1];
  useEffect(() => {
    const id = setTimeout(() => {
      if (last?.role === "assistant" && messages.length > 1) ref.current?.scrollToIndex({ index: messages.length - 1, viewPosition: 0, animated: true });
      else ref.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(id);
  }, [messages.length, last?.role, sending, limitErr]);
  const done = (m: ChatMessage) => m.role === "assistant" && !m.streaming && !m.id.startsWith("local_");
  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => (
        <MessageBubble message={item} agent={agentFor(messages, item, sending, onPick)} onRetry={() => onRetry(item.id)} footer={done(item) ? <MessageActions message={item} onLike={onLike} onDislike={onDislike} /> : undefined} />
      )}
      onScrollToIndexFailed={() => ref.current?.scrollToEnd({ animated: true })}
      ListHeaderComponent={empty ? <AiWelcome onPick={onPick} /> : null}
      ListFooterComponent={
        <View>
          {sending ? <Thinking /> : null}
          {limitErr ? <LimitCard limit={limitErr} /> : !sending && limit && last?.role === "assistant" ? <LimitHint limit={limit} /> : null}
        </View>
      }
      contentContainerStyle={[s.content, empty && s.center]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  center: { flexGrow: 1, justifyContent: "center" },
});
