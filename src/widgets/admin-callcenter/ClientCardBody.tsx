import { useState } from "react";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDate } from "@/shared/lib/format";
import { type ClientCard } from "@/entities/admin-callcenter";
import { ChipBar, KpiGrid, KpiTile } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ClientCardTab, type CardTab } from "./ClientCardTab";

const TABS: CardTab[] = ["orders", "payments", "leads", "activity"];

// Totals and four tabs over the client's history.
export function ClientCardBody({ card }: { card: ClientCard }) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<CardTab>("orders");
  const s = card.summary;
  return (
    <>
      {card.client.createdAt ? <Text variant="caption" tone="gray">{t("admCcB.since", { date: fmtDate(card.client.createdAt, locale) })}</Text> : null}
      <KpiGrid>
        <KpiTile icon="shopping-bag" label={t("admCcC.sumOrders")} value={String(s.orders)} />
        <KpiTile icon="credit-card" tint="#22C55E" label={t("admCcC.sumSpent")} value={`${fmtMoney(s.spent)} ${t("adm.currency")}`} />
        <KpiTile icon="user-plus" tint="#8B5CF6" label={t("admCcC.sumLeads")} value={String(s.leads)} />
        <KpiTile icon="message-square" tint="#06B6D4" label={t("admCcC.sumChats")} value={String(s.rooms)} />
        <KpiTile icon="alert-triangle" tint="#EF4444" label={t("admCcC.sumComplaints")} value={String(s.complaints)} />
        <KpiTile icon="award" tint="#F59E0B" label={t("admCcC.sumSubs")} value={String(s.subscriptions)} />
      </KpiGrid>
      <ChipBar options={TABS.map((v) => ({ value: v, label: t(`admCcC.tab.${v}`) }))} value={tab} onChange={setTab} />
      <ClientCardTab card={card} tab={tab} />
    </>
  );
}
