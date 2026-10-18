import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { openTel } from "@/shared/lib/links";
import type { Lead } from "@/entities/admin-leads";
import { useLeadActions } from "../model/useLeadActions";
import { MeetingButton } from "./MeetingButton";

// Quick actions of a lead: call, video meeting (staff who may start calls) and "log this call".
export function LeadActionsRow({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t } = useT();
  const { canCalls } = useAccess();
  const { call } = useLeadActions(lead);
  if (!lead.phone) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Button title={t("adm.call")} icon="phone" size="sm" onPress={() => openTel(lead.phone)} />
      {canCalls ? <MeetingButton lead={lead} onClose={onClose} /> : null}
      <Button title={t("admLeads.logCall")} icon="phone-outgoing" variant="line" size="sm" loading={call.isPending} onPress={() => call.mutate()} />
    </View>
  );
}
