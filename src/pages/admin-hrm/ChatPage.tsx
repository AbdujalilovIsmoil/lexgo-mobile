import { useLocalSearchParams } from "expo-router";
import { ThreadView } from "@/widgets/admin-hrm";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// /manage/internal/chat?peer=<userId>&name=<name> — the one-to-one chat with a colleague inside the app.
export default function ChatPage() {
  const { t } = useT();
  const { peer, name } = useLocalSearchParams<{ peer?: string; name?: string }>();
  return (
    <AdminPage title={name || t("admHrm.colleague")} subtitle={t("admHrmV.chatLead")}>
      <ThreadView peer={peer ?? ""} />
    </AdminPage>
  );
}
