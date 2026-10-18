import type { ReactElement } from "react";
import { useRouter } from "expo-router";
import { isClosed, isWaiting, TicketRow, ticketTitle, useClaim, useSupportQueue, type SupportTab, type SupportTicket } from "@/entities/admin-support";
import { useSession } from "@/entities/session";
import { TabList } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { tab: SupportTab; header: ReactElement; search?: string; bottomPad?: number };

// One tab of the operator queue: refreshes itself every 10 s; the "new" tab can claim straight from the row; `search`
// narrows the loaded tickets by client, id, subject or last message. 404 = the server has the queue switched off.
export function SupportQueue({ tab, header, search = "", bottomPad }: Props) {
  const { t } = useT();
  const router = useRouter();
  const me = useSession()?.user.id ?? "";
  const { items, query } = useSupportQueue(tab);
  const claim = useClaim();
  const open = (tk: SupportTicket) => router.push(`/cc/assist/${encodeURIComponent(tk.id)}` as never);
  const needle = search.trim().toLowerCase();
  const hit = (tk: SupportTicket) => [tk.clientName, tk.clientLexgoId, tk.workId, ticketTitle(tk, ""), tk.lastMessage].some((x) => x.toLowerCase().includes(needle));
  return (
    <TabList
      bottomPad={bottomPad}
      data={needle ? items.filter(hit) : items}
      query={query}
      keyExtractor={(tk) => tk.id}
      header={header}
      skeletonHeight={104}
      off={{ title: t("admSup.hero.off"), text: t("admSup.hero.offText") }}
      empty={needle ? { icon: "search", title: t("admSup.hero.noMatch") } : { icon: "headphones", title: t("admSup.empty"), text: t("admSup.emptyText") }}
      renderItem={(tk) => (
        <TicketRow
          item={tk}
          unread={tk.operatorUserId === me && !isClosed(tk.status)}
          onPress={() => open(tk)}
          onClaim={tab === "new" && isWaiting(tk.status) ? () => claim.mutate(tk.id, { onSuccess: () => open(tk) }) : undefined}
          claiming={claim.isPending && claim.variables === tk.id}
        />
      )}
    />
  );
}
