import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pill } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useCcLabel, useRegionLabel } from "../model/labels";
import type { QueueItem } from "../model/types";

const ICON = { order: "shopping-bag", lead: "user-plus", urgent_advokat: "zap" } as const;

// One queue entry: type, SLA (red once breached), where it stands, and the action slot.
export function QueueRow({ item, children }: { item: QueueItem; children?: ReactNode }) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const urgent = item.type === "urgent_advokat";
  const m = item.ageMinutes;
  const age = m >= 60 ? t("admCc.ageH", { h: Math.floor(m / 60), m: m % 60 }) : t("admCc.ageM", { n: Math.max(0, m) });
  const sla = item.slaBreached ? t("admCc.slaOver", { age }) : t("admCc.slaLeft", { n: Math.max(0, item.slaMinutes - m), age });
  const hot = item.score === "hot" || item.urgency === "urgent";
  const title = urgent ? label("admCc.kind", item.serviceKind) || item.title : item.type === "lead" ? label("admCc.cat", item.title) : item.title;
  const info = urgent
    ? [label("admCc.ch", item.channel), item.directions.map((d) => label("admCc.dir", d)).join(", "), item.lawyerCount ? t("admCc.lawyersN", { n: item.lawyerCount }) : ""]
    : [item.sellerLoad != null ? t("admCc.sellerLoad", { n: item.sellerLoad }) : ""];
  return (
    <RowCard
      icon={ICON[item.type as keyof typeof ICON] ?? "inbox"}
      tint={item.slaBreached ? "#EF4444" : urgent ? "#8B5CF6" : "#3B82F6"}
      title={title || "—"}
      subtitle={[region(item.region), ...info].filter(Boolean).join(" · ")}
      right={item.status ? <StatusPill status={item.status} label={label("admCc.qStatus", item.status)} /> : undefined}
    >
      <View style={s.pills}>
        <Pill small tone={urgent ? "cy" : item.type === "order" ? "warn" : "gray"} label={label("admCc.qType", item.type)} />
        {hot ? <Pill small tone="err" icon="alert-circle" label={t("admCc.hot")} /> : null}
        <Pill small tone={item.slaBreached ? "err" : "ok"} icon="clock" label={sla} />
        {urgent && item.claimed ? <Pill small tone="ok" icon="check" label={t("admCc.taken")} /> : null}
      </View>
      {children}
    </RowCard>
  );
}

const s = StyleSheet.create({ pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
