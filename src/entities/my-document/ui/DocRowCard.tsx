import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import type { DocRow } from "../model/types";
import { groupOf, toneOf } from "../lib/status";
import { StatusBadge } from "./StatusBadge";
import { MODE_ICON } from "./modeMeta";
import { useToneColor } from "./useToneColor";

// One document in "Mening hujjatlarim": title, work id, status, and what is waiting on whom.
export function DocRowCard({ row, onPress, children }: { row: DocRow; onPress: () => void; children?: ReactNode }) {
  const { t, locale } = useT();
  const color = useToneColor();
  const group = groupOf(row.status);
  const price = row.price > 0 ? `${fmtMoney(row.price)} ${t("adm.currency")}` : "";
  // The row says when it last changed (the backend's own `updated_at` order), not when it was born.
  const meta = [fmtDate(row.updatedAt || row.createdAt, locale), price].filter(Boolean).join(" · ");
  const pooled = row.lawyerActive && !row.lawyer && group !== "ready" && group !== "closed";
  return (
    <RowCard
      icon={MODE_ICON[row.mode]}
      tint={color(toneOf(row.status))}
      title={row.title || t("dm1.untitled")}
      subtitle={[row.workId, row.requestedType].filter(Boolean).join(" · ")}
      meta={meta}
      right={<StatusBadge status={row.status} label={row.statusLabel} />}
      onPress={onPress}
    >
      {group !== "closed" ? <Text variant="caption" tone={group === "ready" ? "ok" : "gray"}>{row.nextAction || t(`dm2.next.${group}`)}</Text> : null}
      <View style={s.chips}>
        <Pill label={t(`dm1.mode.${row.mode}`)} tone="gray" icon={MODE_ICON[row.mode]} small />
        {row.fileReady ? <Pill label={(row.format || "docx").toUpperCase()} tone="ok" icon="file-text" small /> : null}
        {row.lawyer ? <Pill label={row.lawyer} tone="gray" icon="user" small /> : pooled ? <Pill label={t("dcat.pooled")} tone="warn" icon="clock" small /> : null}
        {row.meeting === "active" ? <Pill label={t("dm1.meetingActive")} tone="ok" icon="video" small /> : null}
        {row.rating.submitted && row.rating.value ? <Pill label={`${row.rating.value}/5`} tone="warn" icon="star" small /> : null}
      </View>
      {children}
    </RowCard>
  );
}

const s = StyleSheet.create({ chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
