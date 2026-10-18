import { View } from "react-native";
import { issuesOf, useAvailability, useSaveAvailability } from "@/entities/pro-availability";
import { usePublicProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DeadlinesCard, useAvailabilityEdit } from "@/features/pro-availability-edit";
import { PresenceCard, WeekCard } from "@/widgets/pro-availability";
import { Button } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { Notice, PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// Working hours and answer deadlines (GET/PUT /lawyers/me/availability) + how the marketplace shows the seller.
export default function ProAvailabilityPage() {
  const { t } = useT();
  const userId = useSession()?.user.id ?? "";
  const q = useAvailability();
  const pub = usePublicProfile(userId);
  const ed = useAvailabilityEdit(q.data);
  const save = useSaveAvailability(ed.discard);
  const issues = ed.cur ? issuesOf(ed.cur) : [];
  const footer = ed.dirty ? (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Button title={t("adm.cancel")} variant="line" onPress={ed.discard} style={{ flex: 1 }} />
      <Button title={t("adm.save")} loading={save.isPending} disabled={issues.length > 0} onPress={() => ed.cur && save.mutate(ed.cur)} style={{ flex: 1 }} />
    </View>
  ) : undefined;
  return (
    <AdminPage title={t("nav1.menu.availability")} subtitle={ed.cur ? t(`sl8.source.${ed.cur.source}`) : undefined} footer={footer}>
      <QueryBoundary query={q}>
        {ed.cur ? (
          <PageScroll onRefresh={() => void Promise.all([q.refetch(), pub.refetch()])} refreshing={q.isRefetching}>
            <PresenceCard pub={pub.data} loading={pub.isLoading} />
            <WeekCard value={ed.cur} setDay={ed.setDay} spread={ed.spread} weekdays={ed.weekdays} />
            <DeadlinesCard value={ed.cur.deadlines} onChange={ed.setDeadline} />
            {issues.map((i) => <Notice key={i} tone="err" text={t(`sl8.issue.${i}`)} />)}
          </PageScroll>
        ) : null}
      </QueryBoundary>
    </AdminPage>
  );
}
