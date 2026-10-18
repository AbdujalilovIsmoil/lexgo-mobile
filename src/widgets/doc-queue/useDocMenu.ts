import { useRouter } from "expo-router";
import type { ActionItem } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { chatRoute, docCan, type DocReq } from "@/entities/doc-queue";
import { useMeeting } from "@/features/doc-editor";

type Can = ReturnType<typeof docCan>;
type Handlers = { transfer: () => void; upload: () => void; info?: () => void; source?: () => void };

// The "more" menu of a record: chat, meeting (start or join), transfer, send an own .docx — only what the backend state allows.
export function useDocMenu(doc: DocReq, can: Can, liveId: string, h: Handlers): ActionItem[] {
  const { t } = useT();
  const router = useRouter();
  const meet = useMeeting(doc, liveId);
  const list: (ActionItem | false)[] = [
    !!h.info && { key: "info", icon: "info", label: t("ad5.requestInfo"), onPress: () => h.info?.() },
    !!h.source && can.editor && { key: "source", icon: "layers", label: t("ad4.chooseSource"), onPress: () => h.source?.() },
    can.chat && { key: "chat", icon: "message-circle", label: t("ad1.chat"), onPress: () => router.push(chatRoute(doc.chatRoomId)) },
    can.meeting && { key: "meet", icon: "video", label: meet.live ? t("ad1.joinMeeting") : t("ad1.startMeeting"), onPress: () => (meet.live ? meet.join() : (toast(t("ad5.meetingOpening"), "info"), meet.start.mutate())) },
    can.upload && { key: "upload", icon: "upload", label: t("ad1.sendOwn"), onPress: h.upload },
    can.transfer && { key: "transfer", icon: "repeat", label: t("ad1.transfer"), onPress: h.transfer },
  ];
  return list.filter((x): x is ActionItem => !!x);
}
