import { useState } from "react";
import { View } from "react-native";
import type { ClientCard } from "@/entities/admin-callcenter";
import { ChipBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ActivityTab } from "./tabs/ActivityTab";
import { ContactsTab } from "./tabs/ContactsTab";
import { DocsTab } from "./tabs/DocsTab";
import { LeadsTab } from "./tabs/LeadsTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { TicketsTab } from "./tabs/TicketsTab";
import { WorksTab } from "./tabs/WorksTab";

const TABS = ["works", "tickets", "docs", "payments", "contacts", "leads", "activity"] as const;
type Tab = (typeof TABS)[number];

// The client's history in seven views: works, support tickets, documents, payments, contact notes, leads, activity.
export function ClientTabs({ card }: { card: ClientCard }) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("works");
  const client = card.client;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ marginHorizontal: -16 }}><ChipBar options={TABS.map((v) => ({ value: v, label: t(`cc2.tab.${v}`) }))} value={tab} onChange={setTab} /></View>
      {tab === "works" ? <WorksTab card={card} /> : null}
      {tab === "tickets" ? <TicketsTab clientId={client.id} /> : null}
      {tab === "docs" ? <DocsTab card={card} /> : null}
      {tab === "payments" ? <PaymentsTab card={card} /> : null}
      {tab === "contacts" ? <ContactsTab client={client} /> : null}
      {tab === "leads" ? <LeadsTab card={card} /> : null}
      {tab === "activity" ? <ActivityTab card={card} /> : null}
    </View>
  );
}
