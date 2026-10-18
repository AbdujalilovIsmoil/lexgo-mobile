import { useState } from "react";
import { useChatRooms } from "@/entities/client-stats";
import { ChatRow, useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PagedList } from "@/shared/ui/admin";
import { KindChips } from "./KindChips";

type Filter = "unread" | "all";

// Counter "Xabarlar": secure chat rooms; "unread" lists the ones with new messages.
export function ChatsKind() {
  const { t } = useT();
  const nav = useKindNav();
  const query = useChatRooms();
  const [filter, setFilter] = useState<Filter>("unread");
  const all = (query.data ?? []).filter((r) => r.status !== "archived");
  const items = filter === "all" ? all : all.filter((r) => r.unread > 0);
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(r) => r.id}
      header={<KindChips<Filter> value={filter} onChange={setFilter} options={[{ value: "unread", label: t("cl7.filters.unread"), count: all.filter((r) => r.unread > 0).length }, { value: "all", label: t("cl7.filters.all"), count: all.length }]} />}
      empty={{ icon: "message-circle", title: t("cl7.empty.chats"), text: t("cl7.empty.chatsText") }}
      renderItem={(r) => <ChatRow room={r} onPress={() => nav.chat(r.id)} />}
    />
  );
}
