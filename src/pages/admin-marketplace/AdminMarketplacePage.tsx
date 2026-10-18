import { useState } from "react";
import { View } from "react-native";
import { useLiveRefresh, type MktOrder, type MktPerson, type MktSeller } from "@/entities/admin-marketplace";
import { useMktFilters, type Party } from "@/features/admin-marketplace";
import { OrderSheet, OrdersTab, OverviewTab, SellersTab } from "@/widgets/admin-marketplace";
import { AdminPage } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

type Tab = "overview" | "orders" | "sellers";
const party = (p: { id?: string; userId?: string; name: string; phone: string; lexgoId: string }): Party => ({ id: p.id ?? p.userId ?? "", label: p.name || p.phone || p.lexgoId || "—" });

// Marketplace monitor (read-only, refreshes every minute): overview, orders and sellers tabs sharing one set of filters.
export default function AdminMarketplacePage() {
  const { t } = useT();
  const f = useMktFilters();
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState<MktOrder | null>(null);
  useLiveRefresh();
  const toOrders = (p: Parameters<typeof f.focus>[0]) => {
    f.focus(p);
    setTab("orders");
  };
  const tabs = (["overview", "orders", "sellers"] as const).map((k) => ({ value: k, label: t(`admMkt.tabs.${k}`) }));
  return (
    <AdminPage title={t("admHub.mod.marketplace.title")} subtitle={t("admMkt.eyebrow")} right={<ExportButton id={tab === "sellers" ? "sellers" : "orders"} />}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "overview" ? <OverviewTab f={f} onStatus={(status) => toOrders({ status })} onSeller={(s: MktSeller) => toOrders({ seller: party(s), client: null, status: "" })} onTab={setTab} onOpen={setOpen} /> : null}
      {tab === "orders" ? <OrdersTab f={f} onOpen={setOpen} /> : null}
      {tab === "sellers" ? <SellersTab f={f} onOrders={(s) => toOrders({ seller: party(s), client: null, status: "" })} /> : null}
      <OrderSheet order={open} onClose={() => setOpen(null)} onSeller={(p: MktPerson) => { setOpen(null); toOrders({ seller: party(p), client: null, status: "" }); }} onClient={(p: MktPerson) => { setOpen(null); toOrders({ client: party(p), seller: null, status: "" }); }} />
    </AdminPage>
  );
}
