import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ticketAccess, ticketTitle, useAssistContext, useClaim, useTicket } from "@/entities/admin-support";
import { CloseSheet, ReopenSheet, TransferSheet, useChatPing, useSupportCall, useSupportLive } from "@/features/admin-support";
import { AssistView, ChatView, TicketBar, TicketDetailsSheet } from "@/widgets/admin-support";
import { useSession } from "@/entities/session";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { IconButton, Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Sheet = "transfer" | "close" | "reopen" | "details" | null;

// One ticket: status and actions on top, then the chat or the assist panel (client context + requests on their behalf).
export default function AdminSupportTicketPage() {
  const params = useLocalSearchParams<{ id?: string; ticketId?: string }>();
  const id = params.id ?? params.ticketId ?? "";
  const { t } = useT();
  const user = useSession()?.user;
  const meId = user?.id ?? "";
  const q = useTicket(id);
  const tk = q.data ?? null;
  const acc = ticketAccess(tk, meId, user?.backendRole);
  const caps = useAssistContext(tk?.id ?? "", acc.ownOpen || acc.watching).data?.caps;
  const call = useSupportCall(tk);
  const claim = useClaim();
  const ping = useChatPing(tk, meId);
  useSupportLive(id);
  const [view, setView] = useState<"chat" | "assist">("chat");
  const [sheet, setSheet] = useState<Sheet>(null);
  const callable = acc.ownOpen && caps?.supportCall === true;
  const right = (
    <>
      {callable ? <IconButton icon="phone" size={38} label={t("admSup.callAudio")} onPress={() => call.start("audio")} /> : null}
      {callable ? <IconButton icon="video" size={38} label={t("admSup.callVideo")} onPress={() => call.start("video")} /> : null}
      <IconButton icon="info" size={38} label={t("adm.details")} onPress={() => setSheet("details")} />
    </>
  );
  return (
    <AdminPage title={tk?.clientName || (tk ? ticketTitle(tk, t("admSup.untitled")) : t("admSup.untitled"))} subtitle={tk?.workId} right={tk ? right : undefined}>
      <QueryBoundary query={q}>
        {tk ? (
          <>
            <TicketBar ticket={tk} acc={acc} transferOn={caps?.operatorTransfer === true} claiming={claim.isPending} on={{ claim: () => claim.mutate(tk.id), transfer: () => setSheet("transfer"), close: () => setSheet("close"), reopen: () => setSheet("reopen") }} />
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <Segmented options={[{ value: "chat", label: ping.count ? `${t("admSup.viewChat")} · ${ping.count}` : t("admSup.viewChat"), icon: "message-circle" }, { value: "assist", label: t("admSupB.title"), icon: "headphones" }]} value={view} onChange={(v) => { setView(v); if (v === "assist") ping.leave(); else ping.back(); }} />
            </View>
            <View style={{ flex: 1 }}>{view === "chat" ? <ChatView ticket={tk} meId={meId} canWrite={acc.ownOpen} /> : <AssistView ticket={tk} acc={acc} onCall={call.start} calling={call.calling} />}</View>
          </>
        ) : null}
      </QueryBoundary>
      <TransferSheet ticket={tk} visible={sheet === "transfer"} onClose={() => setSheet(null)} />
      <CloseSheet ticket={tk} visible={sheet === "close"} onClose={() => setSheet(null)} />
      <ReopenSheet ticket={tk} visible={sheet === "reopen"} onClose={() => setSheet(null)} />
      <TicketDetailsSheet ticket={tk} visible={sheet === "details"} onClose={() => setSheet(null)} />
    </AdminPage>
  );
}
