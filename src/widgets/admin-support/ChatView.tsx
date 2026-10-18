import { StyleSheet, View } from "react-native";
import { isClosed, type SupportTicket } from "@/entities/admin-support";
import { Composer, useTicketChat } from "@/features/admin-support";
import { KeyboardLift } from "@/shared/ui/admin";
import { EmptyState, ErrorView, Icon, Skeleton, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ChatList } from "./ChatList";
import { ClosedBanner } from "./ClosedBanner";

type Props = { ticket: SupportTicket; meId: string; canWrite: boolean };

// The conversation of a ticket with a message box; read-only unless the ticket is assigned to me.
export function ChatView({ ticket, meId, canWrite }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const chat = useTicketChat(ticket, meId);
  const q = chat.query;
  const empty = !chat.messages.length;
  return (
    <KeyboardLift>
      <View style={s.fill}>
        {q.isLoading ? <View style={s.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={54} round={18} />)}</View> : null}
        {q.isError && empty ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : null}
        {!q.isLoading && !q.isError && empty ? <EmptyState icon="message-circle" title={t("admSup.noMessages")} compact /> : null}
        {!empty ? <ChatList messages={chat.messages} meId={meId} hasMore={chat.hasMore} loadingOlder={chat.loadingOlder} onOlder={() => void chat.loadOlder()} onRetry={chat.retry} /> : null}
      </View>
      {isClosed(ticket.status) ? (
        <ClosedBanner ticket={ticket} />
      ) : canWrite ? (
        <Composer onSend={chat.send} blocked={chat.blocked} />
      ) : (
        <View style={[s.ro, { borderTopColor: c.line, backgroundColor: c.surface2, paddingBottom: insets.bottom + 12 }]}>
          <Icon name="lock" size={16} tone="gray" />
          <Text variant="small" tone="gray" style={s.fill}>{t("admSup.readOnly")}</Text>
        </View>
      )}
    </KeyboardLift>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  sk: { padding: 16, gap: 12 },
  ro: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
});
