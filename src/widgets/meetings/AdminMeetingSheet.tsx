import { Text } from "@/shared/ui";
import { FactRows, FormSheet, QueryBoundary, SectionCard, StatusPill } from "@/shared/ui/admin";
import { csLabel, useAdminCall } from "@/entities/call";
import { fmtDateTime, mmss } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// Platform-wide meeting detail (GET /admin/calls/{id}): work id, status, room, times, creator, participants.
export function AdminMeetingSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t, locale } = useT();
  const kept = useKept(id);
  const q = useAdminCall(kept);
  const d = q.data;
  const c = d?.call;
  return (
    <FormSheet visible={!!id} onClose={onClose} title={c?.title || t("admMeet.detailTitle")} subtitle={c?.workId}>
      <QueryBoundary query={q}>
        {d && c ? (
          <>
            <FactRows rows={[
              { label: t("adm.status"), value: <StatusPill status={c.status} label={csLabel(t, c.status)} /> },
              { label: t("admMeet.type"), value: t(`admMeet.fmt.${c.type}`) },
              { label: t("admMeet.room"), value: d.roomTitle || c.roomId.slice(0, 8) },
              { label: t("admMeet.started"), value: fmtDateTime(c.startedAt, locale) },
              { label: t("admMeet.endedAt"), value: fmtDateTime(c.endedAt, locale) },
              { label: t("admMeet.duration"), value: d.durationMin ? t("admMeet.minutes", { n: d.durationMin }) : c.durationSec ? mmss(c.durationSec * 1000) : "" },
              { label: t("admMeet.creator"), value: d.creator?.name || c.creatorName },
              { label: t("adm.phone"), value: d.creator?.phone },
            ]} />
            <SectionCard title={`${t("admMeet.participants")} (${d.participants.length})`}>
              {d.participants.length ? d.participants.map((p) => (
                <Text key={p.userId} variant="small"><Text variant="small" weight="bold">{p.name || p.userId}</Text>{`  ${[p.role, p.status].filter(Boolean).join(" · ")}`}</Text>
              )) : <Text variant="small" tone="gray">{t("admMeet.noParticipants")}</Text>}
            </SectionCard>
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
