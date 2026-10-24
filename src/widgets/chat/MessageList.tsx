import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MessageBubble, type Agent, type ChatLimit, type ChatMessage, type GuestLimit } from "@/entities/chat";
import { LimitCard, LimitHint, MessageActions } from "@/features/ai-chat";
import { AiWelcome } from "./AiWelcome";
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

type RowProps = { item: ChatMessage; last: boolean; sending: boolean; question: string; onPick: (text: string) => void; onRetry: (id: string) => void; onLike: (id: string) => void; onDislike: (id: string) => void };

// One message. Memoised on primitives and stable callbacks, so while an answer streams only its own row re-renders — the
// older answers (each a parsed markdown tree) are left alone. Follow-up chips and "retry" belong to the latest answer only.
const Row = memo(function Row({ item, last, sending, question, onPick, onRetry, onLike, onDislike }: RowProps) {
  const interactive = last && !sending;
  const agent = useMemo<Agent | undefined>(() => (item.role === "assistant" ? { interactive, onAsk: onPick, onRetry: () => question && onPick(question) } : undefined), [item.role, interactive, onPick, question]);
  const done = item.role === "assistant" && !item.streaming && !item.id.startsWith("local_");
  return <MessageBubble message={item} agent={agent} onRetry={() => onRetry(item.id)} footer={done ? <MessageActions message={item} onLike={onLike} onDislike={onDislike} /> : undefined} />;
});

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
  const render = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      let question = "";
      if (item.role === "assistant") for (let i = index - 1; i >= 0; i--) if (messages[i].role === "user") { question = messages[i].content; break; }
      return <Row item={item} last={index === messages.length - 1} sending={sending} question={question} onPick={onPick} onRetry={onRetry} onLike={onLike} onDislike={onDislike} />;
    },
    [messages, sending, onPick, onRetry, onLike, onDislike],
  );
  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={(m) => m.id}
      renderItem={render}
      initialNumToRender={8}
      windowSize={7}
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
