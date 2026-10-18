import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useCcLabel, useRegionLabel } from "../model/labels";
import type { UrgentRequest } from "../model/urgentTypes";

const ICON = {
  video_consultation: "video",
  express_video_consultation: "zap",
  traffic_accident_consultation: "alert-triangle",
  chat_consultation: "message-circle",
  second_opinion_single: "user-check",
  second_opinion_group: "users",
} as const;

// One Tezkor Advokat request: service, client, practice areas, schedule and the action slot.
export function UrgentRow({ item, onPress, children }: { item: UrgentRequest; onPress?: () => void; children?: ReactNode }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const kind = label("admCc.kind", item.serviceKind) || item.serviceTitle;
  const group = item.serviceKind === "second_opinion_group";
  return (
    <RowCard
      icon={ICON[item.serviceKind as keyof typeof ICON] ?? "briefcase"}
      tint={item.slaBreached ? "#EF4444" : item.status === "open_pool" ? "#3B82F6" : "#8B5CF6"}
      title={kind}
      subtitle={[item.clientName, item.clientPhone].filter(Boolean).join(" · ")}
      meta={[region(item.region), group && item.lawyerCount ? t("admCc.lawyersN", { n: item.lawyerCount }) : "", fmtDateTime(item.createdAt, locale)].filter(Boolean).join(" · ")}
      right={<StatusPill status={item.status || "open_pool"} label={label("admCc.stat", item.status || "open_pool")} />}
      onPress={onPress}
    >
      {item.need ? <Text variant="small" numberOfLines={2}>{item.need}</Text> : null}
      <View style={s.pills}>
        {item.channel ? <Pill small tone="gray" icon={item.channel === "chat" ? "message-circle" : "video"} label={label("admCc.ch", item.channel)} /> : null}
        {item.workId ? <Pill small tone="blue" label={item.workId} /> : null}
        {item.immediateCall ? <Pill small tone="warn" icon="zap" label={t("admCc.onDuty")} /> : null}
        {item.slaBreached ? <Pill small tone="err" icon="clock" label={t("admCc.sla")} /> : null}
        {item.directions.map((d, i) => <Pill key={`${d}-${i}`} small tone="cy" label={label("admCc.dir", d)} />)}
      </View>
      {item.scheduledAt ? <Text variant="caption" tone="gray">{t("admCc.scheduledFor", { when: fmtDateTime(item.scheduledAt, locale) })}</Text> : null}
      {item.groupLawyers.length ? <Text variant="caption" tone="gray" numberOfLines={2}>{item.groupLawyers.map((g) => g.name).join(", ")}</Text> : null}
      {children}
    </RowCard>
  );
}

const s = StyleSheet.create({ pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
