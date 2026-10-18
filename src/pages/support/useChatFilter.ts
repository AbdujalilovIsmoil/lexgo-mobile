import { useState } from "react";
import { useT } from "@/shared/i18n";
import { ticketTitle, useMyTickets, useSupportLabels, type TicketTab } from "@/entities/support";

// "My chats" state of the hub: status tab (with counts), search over the loaded chats, and the empty states (web order).
export function useChatFilter(signedIn: boolean, composing: boolean) {
  const { t } = useT();
  const labels = useSupportLabels();
  const [tab, setTab] = useState<TicketTab>("active");
  const [q, setQ] = useState("");
  const active = useMyTickets("active", signedIn);
  const closed = useMyTickets("closed", signedIn);
  const cur = tab === "active" ? active : closed;
  const loaded = !active.query.isLoading && !closed.query.isLoading;
  const moreActive = Boolean(active.query.hasNextPage);
  const hasAny = active.items.length + closed.items.length > 0 || moreActive || Boolean(closed.query.hasNextPage);
  const count = (n: number, more: boolean) => (loaded ? ` (${n}${more ? "+" : ""})` : "");
  const needle = q.trim().toLowerCase();
  const shown = needle ? cur.items.filter((tk) => [ticketTitle(tk, ""), tk.lastMessage, tk.workId, labels.category(tk.category), tk.operatorName].join(" ").toLowerCase().includes(needle)) : cur.items;
  const none = { icon: "headphones" as const, title: t("sp1.emptyActive"), text: t("sp1.emptyActiveText") };
  const empty = needle
    ? { icon: "search" as const, title: t("sp1.noMatch"), text: t("sp1.noMatchText"), actionLabel: t("sp1.clearSearch"), onAction: () => setQ("") }
    : tab === "closed" ? { icon: "check-circle" as const, title: t("sp1.emptyClosed") }
    : composing ? { ...none, text: undefined } : hasAny ? none : { icon: "inbox" as const, title: t("sp1.firstTitle"), text: t("sp1.firstText") };
  return {
    tab, setTab, q, setQ, shown, empty, hasAny: loaded && hasAny, moreActive, query: cur.query, ongoing: loaded ? active.items : [],
    counts: { active: count(active.items.length, moreActive), closed: count(closed.items.length, Boolean(closed.query.hasNextPage)) },
  };
}
