import { FocusStatusBar } from "@/shared/ui";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import { AiBackdrop, Composer, FeedbackSheet, PiiNote, useAiChat, useFeedback } from "@/features/ai-chat";
import { ChatHeader, MessageList } from "@/widgets/chat";

// LexGo.AI. Always dark. The tab bar is hidden here, so the header has an exit
// (✕) back to Home. A question typed on the Home hero arrives as `?q=`.
export function AiChatPage() {
  const router = useRouter();
  const chat = useAiChat();
  const fb = useFeedback();
  const { t } = useT();
  const screen = useInstructorTarget("screen:ai", { label: t("ai.title"), type: "screen" });
  const { q } = useLocalSearchParams<{ q?: string }>();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const question = typeof q === "string" ? q.trim() : "";
    if (!question || !chat.clientId || sent.current === question) return;
    sent.current = question;
    void chat.send(question);
    router.setParams({ q: "" });
  }, [q, chat, router]);

  const remaining = chat.limit ? chat.limit.remainingToday : null;
  const blocked = !chat.clientId || (!!chat.limitErr && chat.limitErr.kind !== "rate");
  return (
    <View {...screen} style={s.fill}>
      <FocusStatusBar style="light" />
      <AiBackdrop />
      <ChatHeader onClose={() => router.navigate("/")} onNew={chat.newChat} onHistory={() => router.push("/chats")} remaining={remaining} />
      <KeyboardAvoidingView behavior="padding" style={s.flex}>
        <MessageList
          messages={chat.messages}
          sending={chat.sending}
          limitErr={chat.limitErr}
          limit={chat.limit}
          onPick={(text) => void chat.send(text)}
          onRetry={chat.retry}
          onLike={(id) => void fb.submit(id, true)}
          onDislike={fb.askWhy}
        />
        <PiiNote />
        <Composer onSend={(text) => void chat.send(text)} disabled={blocked} sending={chat.sending} />
      </KeyboardAvoidingView>
      <FeedbackSheet visible={!!fb.target} busy={fb.busy} onClose={fb.close} onSubmit={(c) => fb.target && void fb.submit(fb.target, false, c)} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#03102B" },
  flex: { flex: 1 },
});
