import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { EmptyState, IconButton } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { RA_OPENER, RA_VIEW, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { ticketTitle, useTicket } from "@/entities/support";
import { ChatView, SignInGate, TicketBanner, TicketDetailsSheet } from "@/widgets/support";

// /support/[id] — one chat with the operator: status, messages (live), composer, and the ticket's facts.
// Remote assistance (`client.support`): the operator may point at the conversation and open the ticket's facts; writing and sending
// stay the client's own.
export default function SupportTicketPage() {
  const { t } = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSession();
  const q = useTicket(session ? (id ?? "") : "");
  const [details, setDetails] = useState(false);
  const tk = q.data ?? null;
  const gone = q.error instanceof ApiError && (q.error.status === 403 || q.error.status === 404);
  useRaPage("client.support");
  const infoRa = useRaControl(
    {
      id: "support.ticket.details",
      label: t("ra.el.ticketInfo"),
      actions: RA_OPENER,
      state: details ? "selected" : "ready",
      open: () => {
        setDetails(true);
        return raOk();
      },
    },
    !!tk,
  );
  const chatRa = useRaControl({ id: "support.ticket.chat", label: t("ra.el.chat"), actions: RA_VIEW }, !!tk);
  return (
    <AdminPage
      title={tk ? ticketTitle(tk, t("sp1.untitled")) : t("sp3.title")}
      subtitle={tk?.workId}
      right={tk ? <View {...infoRa}><IconButton icon="info" size={38} label={t("adm.details")} onPress={() => setDetails(true)} /></View> : undefined}
    >
      {!session ? (
        <SignInGate />
      ) : gone ? (
        <EmptyState icon="lock" title={t("sp3.missing")} actionLabel={t("sp3.back")} onAction={() => router.replace("/support")} />
      ) : (
        <QueryBoundary query={q}>
          {tk ? (
            <>
              <TicketBanner ticket={tk} />
              <View style={{ flex: 1 }} {...chatRa}><ChatView ticket={tk} meId={session.user.id} /></View>
            </>
          ) : null}
        </QueryBoundary>
      )}
      <TicketDetailsSheet ticket={tk} visible={details} onClose={() => setDetails(false)} />
    </AdminPage>
  );
}
