import { useState } from "react";
import { issuesOf, useAvailability, useSaveAvailability } from "@/entities/pro-availability";
import { usePublicProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DeadlinesCard, PresetBar, useAvailabilityEdit, useLeaveGuard } from "@/features/pro-availability-edit";
import { AvailabilitySkeleton, MarketPreview, SaveBar, StatusCard, WeekCard, useNow, useStatusText } from "@/widgets/pro-availability";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import type { Availability } from "@/entities/pro-availability";

const EMPTY: Availability = { timezone: "Asia/Tashkent", weekly: [], exceptions: [], deadlines: { manual: 30, auto: 15, sos: 5 }, source: "default" };

// Working hours and answer deadlines (GET/PUT /lawyers/me/availability) + how the marketplace shows the seller.
export default function ProAvailabilityPage() {
  const { t } = useT();
  const userId = useSession()?.user.id ?? "";
  const q = useAvailability();
  const pub = usePublicProfile(userId);
  const ed = useAvailabilityEdit(q.data);
  const save = useSaveAvailability(ed.discard);
  const now = useNow();
  const status = useStatusText(ed.cur ?? EMPTY, now, pub.data ? !pub.data.available : false);
  const issues = ed.cur ? issuesOf(ed.cur) : [];
  const [pulling, setPulling] = useState(false);
  useLeaveGuard(ed.dirty && !save.isPending);
  const refresh = async () => {
    setPulling(true);
    try {
      await Promise.all([q.refetch(), pub.refetch()]);
    } finally {
      setPulling(false);
    }
  };
  const reason = issues.length ? t(`sl8.issue.${issues[0]}`) : null;
  const footer = ed.dirty ? <SaveBar reason={reason} saving={save.isPending} onCancel={ed.discard} onSave={() => ed.cur && save.mutate(ed.cur)} /> : undefined;
  return (
    <AdminPage title={t("nav1.menu.availability")} subtitle={ed.cur ? t(`sl8.source.${ed.cur.source}`) : undefined} footer={footer}>
      <QueryBoundary query={q} skeleton={<AvailabilitySkeleton />}>
        {ed.cur ? (
          <PageScroll onRefresh={() => void refresh()} refreshing={pulling}>
            <StatusCard status={status} />
            <PresetBar weekly={ed.cur.weekly} onPick={ed.preset} />
            <WeekCard value={ed.cur} setDay={ed.setDay} copyAll={ed.copyAll} noDay={issues.includes("noDay")} />
            <DeadlinesCard value={ed.cur.deadlines} onChange={ed.setDeadline} />
            <MarketPreview pub={pub.data} loading={pub.isLoading} status={status} />
          </PageScroll>
        ) : null}
      </QueryBoundary>
    </AdminPage>
  );
}
