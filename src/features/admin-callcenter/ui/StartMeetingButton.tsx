import { useRouter } from "expo-router";
import { chatHref, useStartMeeting } from "@/entities/admin-callcenter";
import { Button } from "@/shared/ui";
import { CcAction } from "@/shared/ui/cc";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";

type Props = { clientUserId: string; phone: string; name: string; round?: boolean };

// One tap: open a secure room with the lead's client, start a video meeting with them invited and join it.
// Hidden for accounts that cannot start calls (meetings.manage / call-center).
export function StartMeetingButton({ clientUserId, phone, name, round }: Props) {
  const { t } = useT();
  const router = useRouter();
  const { canCalls } = useAccess();
  const m = useStartMeeting((ids) => router.push(chatHref(ids.roomId, { join: ids.callId })));
  if (!canCalls || (!clientUserId && !phone)) return null;
  const title = name ? t("admCcB.meetTitle", { name }) : t("admCcB.meetStart");
  const go = () => m.mutate({ clientUserId, phone, title });
  if (round) return <CcAction icon="video" label={t("admCcB.meetStart")} loading={m.isPending} onPress={go} />;
  return <Button title={t("admCcB.meetStart")} icon="video" variant="soft" size="sm" loading={m.isPending} onPress={go} />;
}
