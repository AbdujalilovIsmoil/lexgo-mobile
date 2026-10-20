import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mktKeys, useLiveRefresh, useOverview, type MktOrder, type MktPerson, type MktSeller } from "@/entities/admin-marketplace";
import { useMktFilters, type Party } from "@/features/admin-marketplace";
import { MktHero, OrderSheet, OrdersTab, OverviewTab, SellersTab, useScopeText, type MktTab } from "@/widgets/admin-marketplace";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

const party = (p: { id?: string; userId?: string; name: string; phone: string; lexgoId: string }): Party => ({ id: p.id ?? p.userId ?? "", label: p.name || p.phone || p.lexgoId || "—" });

// Marketplace monitor (read-only, refreshes every minute): overview, orders and sellers tabs sharing one set of filters.
export default function AdminMarketplacePage() {
  const { t } = useT();
  const f = useMktFilters();
  const [tab, setTab] = useState<MktTab>("overview");
  const [open, setOpen] = useState<MktOrder | null>(null);
  useLiveRefresh();
  const toOrders = (p: Parameters<typeof f.focus>[0]) => {
    f.focus(p);
    setTab("orders");
  };
  const qc = useQueryClient();
  const overview = useOverview(f.scope);
  const scope = useScopeText(f);
  const hero = (
    <MktHero
      stats={overview.data}
      updatedAt={overview.dataUpdatedAt}
      scope={scope}
      tab={tab}
      onTab={setTab}
      busy={overview.isRefetching}
      failed={overview.isError}
      onRefresh={() => void qc.refetchQueries({ queryKey: mktKeys.all, type: "active" })}
    />
  );
  return (
    <AdminPage title={t("admHub.mod.marketplace.title")} right={<ExportButton id={tab === "sellers" ? "sellers" : "orders"} />}>
      {tab === "overview" ? <OverviewTab f={f} onStatus={(status) => toOrders({ status })} onSeller={(s: MktSeller) => toOrders({ seller: party(s), client: null, status: "" })} onTab={setTab} onOpen={setOpen} hero={hero} /> : null}
      {tab === "orders" ? <OrdersTab f={f} onOpen={setOpen} hero={hero} /> : null}
      {tab === "sellers" ? <SellersTab f={f} onOrders={(s) => toOrders({ seller: party(s), client: null, status: "" })} hero={hero} /> : null}
      <OrderSheet order={open} onClose={() => setOpen(null)} onSeller={(p: MktPerson) => { setOpen(null); toOrders({ seller: party(p), client: null, status: "" }); }} onClient={(p: MktPerson) => { setOpen(null); toOrders({ client: party(p), seller: null, status: "" }); }} />
    </AdminPage>
  );
}
