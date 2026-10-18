import type { ClientCard } from "@/entities/admin-callcenter";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Totals of the client: orders, money paid, leads, chats, complaints, active subscriptions.
export function ClientKpis({ card }: { card: ClientCard }) {
  const { t } = useT();
  const s = card.summary;
  return (
    <KpiGrid>
      <KpiTile icon="shopping-bag" label={t("admCcC.sumOrders")} value={String(s.orders)} />
      <KpiTile icon="credit-card" tint="#22C55E" label={t("admCcC.sumSpent")} value={`${fmtMoney(s.spent)} ${t("adm.currency")}`} />
      <KpiTile icon="user-plus" tint="#8B5CF6" label={t("admCcC.sumLeads")} value={String(s.leads)} />
      <KpiTile icon="message-square" tint="#06B6D4" label={t("admCcC.sumChats")} value={String(s.rooms)} />
      <KpiTile icon="alert-triangle" tint="#EF4444" label={t("admCcC.sumComplaints")} value={String(s.complaints)} />
      <KpiTile icon="award" tint="#F59E0B" label={t("admCcC.sumSubs")} value={String(s.subscriptions)} />
    </KpiGrid>
  );
}
