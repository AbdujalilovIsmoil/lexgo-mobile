import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { FilePreview, type FileRef } from "@/shared/ui/preview";
import { KeyboardLift } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { isClosed, useSupportLabels, useSupportLive, type SupportTicket } from "@/entities/support";
import { Composer, ReopenSheet, useAssistStore, useRingingCall, useTicketChat } from "@/features/support";
import { ChatList } from "./ChatList";
import { ClosedBanner } from "./ClosedBanner";
import { chatRows } from "./chatRows";

// The conversation of one ticket with the operator: live messages, assist notes, a ringing call, composer.
export function ChatView({ ticket, meId }: { ticket: SupportTicket; meId: string }) {
  const { t } = useT();
  const router = useRouter();
  const chat = useTicketChat(ticket.id, meId);
  const ring = useRingingCall(ticket.id);
  const all = useAssistStore((s) => s.cards);
  const [file, setFile] = useState<FileRef | null>(null);
  const [reopen, setReopen] = useState(false);
  useSupportLive(ticket.id);
  const labels = useSupportLabels();
  const meta = [labels.category(ticket.category), ticket.workId].filter(Boolean).join(" · ");
  const rows = useMemo(() => chatRows(chat.messages, all.filter((c) => c.ticketId === ticket.id), ring.call), [chat.messages, all, ticket.id, ring.call]);
  const q = chat.query;
  const on = {
    retry: chat.retry,
    file: (a: { url: string; name: string; mime: string }) => setFile({ path: a.url, name: a.name, mime: a.mime }),
    card: (c: { key: string }) => useAssistStore.getState().open(c.key),
    join: (c: { roomId: string; callId: string }) => { ring.dismiss(); router.push(`/call/${encodeURIComponent(c.roomId)}?callId=${encodeURIComponent(c.callId)}` as never); },
    dismiss: ring.dismiss,
  };
  return (
    <KeyboardLift>
      <View style={s.fill}>
        {q.isLoading ? <View style={s.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={54} round={18} />)}</View> : null}
        {q.isError && !rows.length ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : null}
        {!q.isLoading && !q.isError && !rows.length ? <EmptyState icon="message-circle" title={t("sp3.noMessages")} compact /> : null}
        {rows.length ? <ChatList meta={meta} rows={rows} meId={meId} hasMore={chat.hasMore} loadingOlder={chat.loadingOlder} onOlder={() => void chat.older()} on={on} /> : null}
      </View>
      {isClosed(ticket.status) ? <ClosedBanner ticket={ticket} onReopen={() => setReopen(true)} onNew={() => router.navigate("/support?new=1&force=1" as never)} /> : <Composer onSend={chat.send} blocked={chat.blocked} />}
      <ReopenSheet ticketId={ticket.id} visible={reopen} onClose={() => setReopen(false)} />
      <FilePreview visible={file !== null} onClose={() => setFile(null)} file={file} />
    </KeyboardLift>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, sk: { padding: 16, gap: 12 } });
