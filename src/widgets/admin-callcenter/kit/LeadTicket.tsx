import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { StartMeetingButton } from "@/features/admin-callcenter";
import { useCcLabel, useRegionLabel, type BoardLead } from "@/entities/admin-callcenter";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

type Props = { lead: BoardLead; assignee: string; stage: string; busy: boolean; canAssign: boolean; onMove: () => void; onAssign: () => void };
const SCORE = { hot: "err", warm: "warn", cold: "cy" } as const;
const TINT = { hot: "#EF4444", warm: "#F59E0B", cold: "#06B6D4" } as const;

// A lead as a ticket: avatar, score badge, stage + assignee chips, call / meeting / move / assign as round buttons.
export function LeadTicket({ lead, assignee, stage, busy, canAssign, onMove, onAssign }: Props) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const cat = label("admCc.cat", lead.category);
  return (
    <CcTicket
      tint={TINT[lead.score as keyof typeof TINT] ?? "#3B82F6"} avatar={lead.name || lead.phone || cat || "L"}
      title={lead.name || lead.phone || cat || t("admCc.noName")} subtitle={[lead.name ? lead.phone : "", cat, region(lead.region)].filter(Boolean).join(" · ")}
      badge={lead.score ? <Pill small tone={SCORE[lead.score as keyof typeof SCORE]} label={t(`admCc.score.${lead.score}`)} /> : undefined}
      chips={<><Pill small tone="blue" label={stage} /><Pill small tone={lead.assignedTo ? "blue" : "gray"} icon="user" label={assignee} /></>}
      actions={<>
        {lead.phone ? <CcAction icon="phone" label={t("adm.call")} onPress={() => openTel(lead.phone)} /> : null}
        <StartMeetingButton round clientUserId={lead.clientUserId} phone={lead.phone} name={lead.name} />
        {canAssign ? <CcAction icon="user-plus" label={t("adm.assignee")} loading={busy} onPress={onAssign} /> : null}
        <CcAction primary icon="git-merge" label={t("admCc.moveStage")} loading={busy} onPress={onMove} />
      </>}
    />
  );
}
