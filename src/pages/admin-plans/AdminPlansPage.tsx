import { useMemo, useState } from "react";
import { planAudience, usePlans, type Plan } from "@/entities/admin-plans";
import { PlanFormSheet, useSheetTarget } from "@/features/admin-plans";
import { PlanFilters, PlanTicket, usePlanActions, type AudienceFilter } from "@/widgets/admin-plans";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

// Tariffs: filter by audience and visibility, create / edit in a sheet, activate, delete, restore and reset overlay edits straight from ticket buttons.
export default function AdminPlansPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [aud, setAud] = useState<AudienceFilter>("all");
  const [hiddenView, setHiddenView] = useState(false);
  const form = useSheetTarget<{ plan: Plan | null }>();
  const query = usePlans();
  const plans = useMemo(() => query.data?.plans ?? [], [query.data]);
  const view = hiddenView && plans.some((p) => p.hidden);
  const inView = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return plans.filter((p) => p.hidden === view && words.every((w) => [p.name, p.title, p.slug].join(" ").toLowerCase().includes(w)));
  }, [plans, q, view]);
  const list = aud === "all" ? inView : inView.filter((p) => planAudience(p).includes(aud));
  const actions = usePlanActions();
  return (
    <AdminPage title={t("admHub.mod.plans.title")} right={<><ExportButton id="plans" /><IconButton icon="plus" onPress={() => form.open({ plan: null })} /></>}>
      <PagedList
        data={list}
        query={query}
        keyExtractor={(p) => p.id || p.slug}
        renderItem={(p) => <PlanTicket plan={p} acts={actions} onEdit={() => form.open({ plan: p })} />}
        skeletonHeight={110}
        off={{ title: t("admPlansB.off"), text: t("admPlansB.offText") }}
        empty={{ icon: "star", title: plans.length ? t("admPlans.noResults") : t("admPlans.empty") }}
        header={<PlanFilters q={q} onQ={setQ} aud={aud} onAud={setAud} hiddenView={view} onHiddenView={setHiddenView} plans={plans} inView={inView} count={query.data ? list.length : undefined} note={query.data?.activeOnly ? t("admPlans.activeOnly") : view ? t("admPlans.hiddenNote") : undefined} />}
      />
      {form.target ? <PlanFormSheet key={form.key} plan={form.target.plan} visible={form.visible} onClose={form.close} /> : null}
    </AdminPage>
  );
}
