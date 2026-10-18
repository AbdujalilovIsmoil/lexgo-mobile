import { FlatList, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ChatBubble, useLive, useThread } from "@/entities/admin-hrm";
import { useSession } from "@/entities/session";
import { useSendMessage } from "@/features/admin-hrm";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ChatComposer } from "./ChatComposer";

// The chat with one colleague: bubbles (newest at the bottom, list inverted so it sticks there) and the composer.
// The backend needs a subject, so the first line of the text is sent as one.
export function ThreadView({ peer }: { peer: string }) {
  const { t } = useT();
  const me = useSession()?.user.id ?? "";
  const q = useThread(peer);
  const send = useSendMessage();
  useLive();
  const rows = [...(q.data ?? [])].reverse();
  const onSend = (text: string) => send.mutate({ to: peer, body: text, subject: text.split("\n")[0].slice(0, 60) });
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
      {q.isLoading ? <View style={{ padding: 16, gap: 10 }}><Skeleton height={44} width="60%" round={18} /><Skeleton height={44} width="45%" round={18} /></View>
        : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
        : !rows.length ? <EmptyState icon="message-circle" title={t("admHrmV.chatEmpty")} text={t("admHrmV.chatEmptyText")} />
        : (
          <FlatList
            inverted data={rows} keyExtractor={(m) => m.id} renderItem={({ item }) => <ChatBubble item={item} mine={item.senderId === me} />}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <ChatComposer busy={send.isPending} onSend={onSend} />
    </KeyboardAvoidingView>
  );
}
