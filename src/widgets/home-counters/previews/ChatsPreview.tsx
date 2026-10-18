import { useChatRooms } from "@/entities/client-stats";
import { ChatRow, useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PreviewList } from "./PreviewList";

type Props = { go: (fn: () => void) => void };

// Drawer rows of "Xabarlar": chat rooms with unread messages.
export function ChatsPreview({ go }: Props) {
  const { t } = useT();
  const nav = useKindNav();
  const q = useChatRooms();
  const items = (q.data ?? []).filter((r) => r.unread > 0 && r.status !== "archived").slice(0, 5);
  return <PreviewList query={q} items={items} keyOf={(r) => r.id} empty={{ icon: "message-circle", title: t("cl7.empty.chats"), text: t("cl7.empty.chatsText") }} render={(r) => <ChatRow room={r} onPress={() => go(() => nav.chat(r.id))} />} />;
}
