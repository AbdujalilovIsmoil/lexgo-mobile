import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import type { Lead } from "@/entities/admin-leads";
import { useStartMeeting } from "../model/useStartMeeting";

// "Video meeting": opens a secure chat with the client and starts a call (the chat screen joins it).
export function MeetingButton({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t } = useT();
  const meeting = useStartMeeting(lead, useSheetNavigate(onClose));
  return <Button title={t("admLeads.meeting")} icon="video" variant="soft" size="sm" loading={meeting.isPending} onPress={() => meeting.mutate()} />;
}
