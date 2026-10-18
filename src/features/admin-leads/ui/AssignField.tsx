import { View } from "react-native";
import { Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { assigneeLabel, useAssignLead, type Lead, type Operator, type OpsStatus } from "@/entities/admin-leads";

type Props = { lead: Lead; ops: Operator[]; status: OpsStatus; meId: string };

// Who handles the lead. The picker needs the operator list (users.manage); without it only the current assignee shows.
export function AssignField({ lead, ops, status, meId }: Props) {
  const { t } = useT();
  const assign = useAssignLead();
  const pick = (userId: string) => userId !== lead.assignedTo && assign.mutate({ lead, userId, by: meId });
  const current = assigneeLabel(t, ops, lead.assignedTo, meId);
  const known = !lead.assignedTo || ops.some((o) => o.id === lead.assignedTo);
  const options = [
    { value: "", label: t("admLeads.unassigned") },
    ...ops.map((o) => ({ value: o.id, label: o.id === meId ? `${o.name || o.phone} (${t("admLeads.me")})` : o.name || o.phone || o.lexgoId })),
    ...(known ? [] : [{ value: lead.assignedTo, label: current }]),
  ];
  return (
    <View style={{ gap: 8 }}>
      {status === "ready" && ops.length ? <SelectField value={lead.assignedTo} options={options} onChange={pick} placeholder={t("admLeads.pickOperator")} /> : <Text variant="body" weight="semibold">{current}</Text>}
      {status === "forbidden" ? <Text variant="caption" tone="gray2">{t("admLeads.opsForbidden")}</Text> : null}
      {status === "ready" && !ops.length ? <Text variant="caption" tone="gray2">{t("admLeads.noOps")}</Text> : null}
    </View>
  );
}
