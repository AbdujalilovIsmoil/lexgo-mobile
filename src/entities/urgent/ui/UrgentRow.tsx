import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import type { UrgentRequest } from "../model/requestTypes";
import { useUrgentLabels } from "../model/useLabels";
import { kindIcon, statusTint } from "./kindIcon";
import { StatusBadge } from "./StatusBadge";

type Props = { item: UrgentRequest; staff?: boolean; onPress?: () => void; children?: ReactNode };

// One Tezkor Advokat record: service, who/where/when, the pills that matter, and a slot for quick actions.
export function UrgentRow({ item, staff, onPress, children }: Props) {
  const { t, locale } = useT();
  const label = useUrgentLabels();
  const sub = staff ? [item.clientName, item.clientPhone].filter(Boolean).join(" · ") : item.need;
  return (
    <RowCard
      icon={kindIcon(item.serviceKind)}
      tint={item.slaBreached ? "#EF4444" : statusTint(item.status || "open_pool")}
      title={label.kind(item.serviceKind, item.serviceTitle)}
      subtitle={sub}
      meta={[label.region(item.region), fmtDateTime(item.createdAt, locale)].filter(Boolean).join(" · ")}
      right={<StatusBadge status={item.status} />}
      onPress={onPress}
    >
      <View style={s.pills}>
        {item.workId ? <Pill small tone="blue" label={item.workId} /> : null}
        {item.channel ? <Pill small tone="gray" icon={item.channel === "chat" ? "message-circle" : "video"} label={label.channel(item.channel)} /> : null}
        {item.immediateCall ? <Pill small tone="warn" icon="zap" label={t("ug4.now")} /> : null}
        {item.slaBreached ? <Pill small tone="err" icon="clock" label={t("ug4.sla")} /> : null}
        {item.viaOperator ? <Pill small tone="cy" icon="headphones" label={t("ug4.byOperator")} /> : null}
        {item.callStatus === "calling" ? <Pill small tone="ok" icon="phone-call" label={label.call("calling")} /> : null}
        {item.directions.map((d, i) => <Pill key={`${d}-${i}`} small tone="cy" label={label.dir(d)} />)}
      </View>
      {item.scheduledAt ? <Text variant="caption" tone="gray">{t("ug4.scheduledFor", { when: fmtDateTime(item.scheduledAt, locale) })}</Text> : null}
      {item.groupLawyers.length ? <Text variant="caption" tone="gray" numberOfLines={2}>{item.groupLawyers.map((g) => g.name).join(", ")}</Text> : null}
      {children}
    </RowCard>
  );
}

const s = StyleSheet.create({ pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
