import { useRouter } from "expo-router";
import { AdminPage } from "@/shared/ui/admin";
import { RoomsList } from "@/widgets/secure-chat";
import { useRooms } from "@/entities/secure-chat";
import { chatPath } from "@/entities/call";
import { useSession } from "@/entities/session";
import { useSocketState } from "@/shared/realtime";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Staff supervision of EVERY secure chat on the platform (the server hands staff all rooms). Texts stay hidden
// ("[metadata_only]") until a second person approves a reveal. People's own chats live in the Xabarlar tab.
export default function AdminChatsPage() {
  const { t } = useT();
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const q = useRooms(useSocketState() === "online", myId);
  const rooms = q.data ?? [];
  return (
    <AdminPage title={t("admHub.mod.chats.title")} subtitle={t("admChat.count", { n: rooms.length })}>
      <RoomsList query={q} rooms={rooms} myId={myId} bottom={useInsets().bottom + 24} onOpen={(r) => router.push(chatPath(r.id) as never)} />
    </AdminPage>
  );
}
