import { useClient360 } from "@/entities/admin-users";
import { FactRows, FormSheet, KpiGrid, KpiTile, QueryBoundary } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { C360Section } from "./C360Section";

type Target = { id: string; name: string };

// Client 360 (GET /admin/clients/{id}/360): counters, then orders, payments, leads, subscriptions, reviews, complaints and recent activity.
export function Client360Sheet({ target, onClose }: { target: Target | null; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(target);
  const q = useClient360(target?.id ?? "");
  const d = q.data;
  const s = d?.summary;
  return (
    <FormSheet visible={!!target} onClose={onClose} title={kept?.name ?? ""} subtitle={t("ag3.c360.sub")} snaps={[0.8, 0.95]}>
      <QueryBoundary query={q}>
        {d && s ? (
          <>
            <KpiGrid>
              <KpiTile icon="shopping-bag" label={t("ag3.c360.orders")} value={String(s.orders)} />
              <KpiTile icon="credit-card" tint="#22C55E" label={t("ag3.c360.spent")} value={`${fmtMoney(s.spent)} ${t("adm.currency")}`} hint={`${s.payments} ${t("ag3.c360.payments").toLowerCase()}`} />
              <KpiTile icon="trending-up" tint="#06B6D4" label={t("ag3.c360.leads")} value={String(s.leads)} />
              <KpiTile icon="message-circle" tint="#8B5CF6" label={t("ag3.c360.chats")} value={String(s.rooms)} />
            </KpiGrid>
            <FactRows rows={[{ label: t("ag3.c360.cases"), value: String(s.cases) }, { label: t("ag3.c360.complaints"), value: String(s.complaints) }, { label: t("ag3.c360.reviews"), value: String(s.reviews) }]} />
            <C360Section title={t("ag3.c360.orders")} rows={d.orders} />
            <C360Section title={t("ag3.c360.payments")} rows={d.payments} />
            <C360Section title={t("ag3.c360.leads")} rows={d.leads} />
            <C360Section title={t("ag3.c360.subs")} rows={d.subscriptions} />
            <C360Section title={t("ag3.c360.cases")} rows={d.cases} />
            <C360Section title={t("ag3.c360.complaints")} rows={d.complaints} />
            <C360Section title={t("ag3.c360.reviews")} rows={d.reviews} />
            <C360Section title={t("ag3.c360.activity")} rows={d.activities} max={8} />
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
