import { View } from "react-native";
import { Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtDateTime } from "@/shared/lib/format";
import { categoryLabel, regionLabel, scoreLabel, sourceLabel, urgencyLabel, type Lead } from "@/entities/admin-leads";

// What is known about the lead: ids, contact, classification and the free-text note.
export function LeadInfo({ lead }: { lead: Lead }) {
  const { t, locale } = useT();
  return (
    <View style={{ gap: 10 }}>
      <FactRows
        rows={[
          { label: t("admLeads.workId"), value: lead.workId },
          { label: t("adm.phone"), value: lead.phone },
          { label: t("admLeads.category"), value: categoryLabel(t, lead.category) },
          { label: t("admLeads.region"), value: regionLabel(t, lead.region) },
          { label: t("admLeads.source"), value: sourceLabel(t, lead.source) },
          { label: t("admLeads.urgency"), value: urgencyLabel(t, lead.urgency) },
          { label: t("admLeads.score"), value: scoreLabel(t, lead.score) },
          { label: t("adm.created"), value: fmtDate(lead.createdAt, locale) },
          { label: t("admLeads.assignedAt"), value: lead.assignedTo ? fmtDateTime(lead.assignedAt, locale) : "" },
        ]}
      />
      {lead.note ? <Text variant="small" tone="gray">{lead.note}</Text> : null}
    </View>
  );
}
