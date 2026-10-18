import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pill } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useCcLabel, useRegionLabel } from "../model/labels";
import type { BoardLead } from "../model/boardTypes";

const SCORE = { hot: "err", warm: "warn", cold: "cy" } as const;

// One lead on the compact board: contact, category / region, score, assignee and the action slot.
export function LeadCard({ lead, assignee, stage, children }: { lead: BoardLead; assignee: string; stage: string; children?: ReactNode }) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const cat = label("admCc.cat", lead.category);
  return (
    <RowCard
      avatar={lead.name || lead.phone || cat || "L"}
      title={lead.name || lead.phone || cat || t("admCc.noName")}
      subtitle={[lead.workId, lead.name ? cat : "", region(lead.region)].filter(Boolean).join(" · ")}
      meta={lead.name ? lead.phone : ""}
    >
      <View style={s.pills}>
        <Pill small tone="blue" label={stage} />
        {lead.score ? <Pill small tone={SCORE[lead.score as keyof typeof SCORE]} label={t(`admCc.score.${lead.score}`)} /> : null}
        <Pill small tone={lead.assignedTo ? "blue" : "gray"} icon="user" label={assignee} />
      </View>
      {children}
    </RowCard>
  );
}

const s = StyleSheet.create({ pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
