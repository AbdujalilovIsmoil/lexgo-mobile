import { useRouter } from "expo-router";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { RA_OPENER, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { TicketRow, useSupportLive } from "@/entities/support";
import { useNewChat } from "@/features/support";
import { ListControls, NewChatSheet, SignInGate, SupportHome } from "@/widgets/support";
import { useChatFilter } from "./useChatFilter";

// /support - the web hub: title + hours, ongoing chats, AI, operator, other ways, then my chats.
// `?new=1` (the header headset's "Connect to operator") opens the new-chat window straight away.
// Remote assistance (`client.support`): the new-chat button opens the window, whose fields are on the map too (NewTicketFields).
export default function SupportPage() {
  const { t } = useT();
  const router = useRouter();
  const signedIn = Boolean(useSession());
  const nc = useNewChat(signedIn);
  const f = useChatFilter(signedIn, nc.chat.open);
  const open = (id: string) => router.push(`/support/${encodeURIComponent(id)}` as never);
  useSupportLive();
  useRaPage("client.support");
  const newRa = useRaControl(
    {
      id: "support.new_chat",
      label: t("ra.el.newChat"),
      actions: RA_OPENER,
      state: nc.chat.open ? "selected" : "ready",
      open: () => {
        nc.start(false);
        return raOk();
      },
    },
    signedIn,
  );
  return (
    <AdminPage title={t("sp1.title")}>
      {signedIn ? (
        <PagedList
          data={f.shown}
          query={f.query}
          keyExtractor={(tk) => tk.id}
          skeletonHeight={78}
          renderItem={(tk) => <TicketRow item={tk} onPress={() => open(tk.id)} />}
          header={<><SupportHome ongoing={f.ongoing} more={f.moreActive} onAll={() => f.setTab("active")} onStart={nc.start} /><ListControls tab={f.tab} onTab={f.setTab} query={f.q} onQuery={f.setQ} filters={f.hasAny} counts={f.counts} onNew={() => nc.start(false)} newBox={newRa} /></>}
          empty={f.empty}
          off={{ title: t("sp1.title"), text: t("sp1.soon") }}
        />
      ) : (
        <SignInGate />
      )}
      <NewChatSheet visible={nc.chat.open} onClose={nc.close} initial={nc.chat} onOpenTicket={open} />
    </AdminPage>
  );
}
