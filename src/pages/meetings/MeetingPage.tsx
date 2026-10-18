import { useLocalSearchParams } from "expo-router";
import { AdminPage } from "@/shared/ui/admin";
import { MeetingDetail } from "@/widgets/meetings";
import { useMeeting } from "@/features/meeting";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /meetings/<callId>[?room=<roomId>] — one meeting: roster, time left, recording state and the actions the server allows.
export default function MeetingPage() {
  const { t } = useT();
  const { id, room } = useLocalSearchParams<{ id: string; room?: string }>();
  const m = useMeeting(String(id), room ? String(room) : "");
  return (
    <AdminPage title={m.call?.title || t("ms7.detail")} subtitle={m.call?.workId || undefined}>
      <MeetingDetail m={m} bottom={useInsets().bottom + 24} />
    </AdminPage>
  );
}
