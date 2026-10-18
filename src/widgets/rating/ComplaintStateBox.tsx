import { View } from "react-native";
import { complaintStage, useComplaintLabels, type ComplaintItem } from "@/entities/rating";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const ICON: Record<string, IconName> = { new: "inbox", review: "clock", rework: "refresh-cw", resolved: "check-circle", rejected: "x-circle", closed: "archive" };

// Where the review stands: tag + hint (+ "write to the operator" after a rejection) + decision / update time.
export function ComplaintStateBox({ c }: { c: ComplaintItem }) {
  const { t, locale } = useT();
  const L = useComplaintLabels();
  const stage = complaintStage(c.status);
  const decided = stage === "resolved" || stage === "rejected" || stage === "closed";
  const decidedAt = decided ? c.resolvedAt || c.updatedAt : "";
  const meta = [c.operatorName && !c.operatorNote && decided ? t("pwc.decisionBy", { name: c.operatorName }) : "", decidedAt ? fmtDateTime(decidedAt, locale) : ""].filter(Boolean).join(" · ");
  const changed = !decided && c.updatedAt && Math.abs(Date.parse(c.updatedAt) - Date.parse(c.createdAt)) > 60000 ? c.updatedAt : "";
  return (
    <Card tinted style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <Icon name={ICON[stage]} size={20} tone="accent" />
      <View style={{ flex: 1, gap: 4 }}>
        {decided || stage === "rework" ? <Text variant="small" weight="bold">{L.tag(c.status)}</Text> : null}
        <Text variant="small">{L.hint(c)}</Text>
        {stage === "rejected" ? <Text variant="caption" tone="gray">{t("pwc.escalate")}</Text> : null}
        {decided && meta ? <Text variant="caption" tone="gray2">{meta}</Text> : null}
        {changed ? <Text variant="caption" tone="gray2">{t("pwc.updatedAt", { date: fmtDateTime(changed, locale) })}</Text> : null}
      </View>
    </Card>
  );
}
