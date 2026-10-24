import { StyleSheet, View } from "react-native";
import { fixedCell, useGrid } from "@/shared/lib/useGrid";
import { useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";
import { PaymentNote } from "../PaymentNote";
import { Card } from "./Card";
import Animated from "react-native-reanimated";

type Fact = { icon: IconName; label: string; value: string };

// The key facts as a tidy two-column grid; a fact the record does not have is simply not shown.
export function FactsGrid({ req }: { req: UrgentRequest }) {
  const grid = useGrid({ min: 220 });
  const { t, locale } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const facts = ([
    { icon: "map-pin", label: t("ug2.region"), value: label.region(req.region) },
    { icon: req.channel === "chat" ? "message-circle" : "video", label: t("ugx.factChannel"), value: req.channel ? label.channel(req.callChannel === "audio" ? "audio" : req.channel) : "" },
    { icon: "clock", label: t("ugx.factDuration"), value: req.meetingMinutes ? t("ug4.minutesN", { n: req.meetingMinutes }) : "" },
    { icon: "credit-card", label: t("ugx.factPrice"), value: req.amount ? `${fmtMoney(req.amount)} ${t("adm.currency")}` : "" },
    { icon: "calendar", label: t("ugx.factScheduled"), value: fmtDateTime(req.scheduledAt, locale) },
    { icon: "inbox", label: t("ugx.factCreated"), value: fmtDateTime(req.createdAt, locale) },
    { icon: "user-check", label: t("ug7.assignedLawyer"), value: req.assignedLawyer?.name ?? req.claimedBy?.name ?? "" },
    { icon: "headphones", label: t("ug7.operator"), value: req.operator?.name ?? "" },
    { icon: "users", label: t("ugx.factRequested"), value: req.serviceKind === "second_opinion_group" && req.lawyerCount ? String(req.lawyerCount) : "" },
    { icon: "phone-call", label: t("ugx.factCall"), value: req.callStatus ? label.call(req.callStatus) : "" },
  ] as Fact[]).filter((f) => f.value);
  return (
    <Card icon="grid" title={t("ugx.facts")}>
      <View style={s.grid} onLayout={grid.onLayout}>
        {grid.ready ? facts.map((f) => (
          <Animated.View key={f.label} layout={grid.move} style={[s.tile, { backgroundColor: c.surface2 }, fixedCell(grid.cell)]}>
            <Icon name={f.icon} size={16} tone="accent" />
            <Text variant="caption" tone="gray" numberOfLines={1}>{f.label}</Text>
            <Text variant="small" weight="bold" numberOfLines={2} selectable>{f.value}</Text>
          </Animated.View>
        )) : null}
      </View>
      <PaymentNote req={req} />
    </Card>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, gap: 4, padding: 12, borderRadius: 16 },
});
