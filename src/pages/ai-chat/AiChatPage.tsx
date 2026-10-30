import { FocusStatusBar } from "@/shared/ui";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useT } from "@/shared/i18n";
import { useAiTheme } from "@/shared/theme";
import { useInstructorTarget } from "@/shared/instructor";
import { AiBackdrop, Composer, FeedbackSheet, useAiChat, useFeedback } from "@/features/ai-chat";
import { ChatHeader, MessageList } from "@/widgets/chat";
import { homeRoute } from "@/widgets/tab-bar/tabConfig";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// LexGo.AI, in the app's light or dark theme. The tab bar is hidden here, so the header has an exit
// (✕) back to Home. A question typed on the Home hero arrives as `?q=`.
export function AiChatPage() {
  const router = useRouter();
  const chat = useAiChat();
  const fb = useFeedback();
  const { t } = useT();
  const aiTheme = useAiTheme();
  const screen = useInstructorTarget("screen:ai", { label: t("ai.title"), type: "screen" });
  const { q } = useLocalSearchParams<{ q?: string }>();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const question = typeof q === "string" ? q.trim() : "";
    // `sent` only keeps one question from going twice while its `?q=` is still on the route; once cleared, the same words may be asked again.
    if (!question) { sent.current = null; return; }
    if (!chat.clientId || sent.current === question) return;
    sent.current = question;
    void chat.send(question);
    router.setParams({ q: "" });
  }, [q, chat, router]);

  // The way out is the role's own first tab: for a lawyer or a manager the home tab "/" is not in the system bar, and the bar cannot
  // be sent to a tab it hides — the ✕ did nothing there.
  const role = useTabRole();
  const close = useCallback(() => {
    const first = homeRoute(role);
    router.navigate(first === "index" ? "/" : (`/(tabs)/${first}` as never));
  }, [role, router]);
  const { send, retry } = chat;
  const { submit, askWhy } = fb;
  const pick = useCallback((text: string) => void send(text), [send]);
  const like = useCallback((id: string) => void submit(id, true), [submit]);
  const remaining = chat.limit ? chat.limit.remainingToday : null;
  // Busy until the answer is complete: the request in flight, or an answer still arriving in pieces over the socket.
  const tail = chat.messages[chat.messages.length - 1];
  const busy = chat.sending || (tail?.role === "assistant" && !!tail.streaming);
  const blocked = !chat.clientId || (!!chat.limitErr && chat.limitErr.kind !== "rate");
  return (
    <View {...screen} style={[s.fill, { backgroundColor: aiTheme.bg }]}>
      <FocusStatusBar style={aiTheme.dark ? "light" : "dark"} />
      <AiBackdrop />
      <ChatHeader onClose={close} onNew={chat.newChat} onHistory={() => router.push("/chats")} remaining={remaining} />
      <KeyboardAvoidingView behavior="padding" style={s.flex}>
        <MessageList
          messages={chat.messages}
          sending={chat.sending}
          limitErr={chat.limitErr}
          limit={chat.limit}
          onPick={pick}
          onRetry={retry}
          onLike={like}
          onDislike={askWhy}
        />
        <Composer onSend={pick} onStop={chat.stop} disabled={blocked} sending={busy} />
      </KeyboardAvoidingView>
      <FeedbackSheet visible={!!fb.target} busy={fb.busy} onClose={fb.close} onSubmit={(c) => fb.target && void fb.submit(fb.target, false, c)} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
});
