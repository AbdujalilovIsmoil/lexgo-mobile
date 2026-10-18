import { useState } from "react";
import { useAccess } from "@/entities/access";
import { OfferRow, useOffers, type Offer } from "@/entities/admin-upsell";
import { useUserNames } from "@/entities/admin-users";
import { OfferFormSheet } from "@/features/admin-upsell";
import { OfferSheet } from "@/widgets/admin-upsell";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { useT } from "@/shared/i18n";

// Upsell: personal offers made to clients (list for everyone with access; creating one needs subscriptions.manage).
export default function AdminUpsellPage() {
  const { t } = useT();
  const canCreate = useAccess().can("subscriptions.manage");
  const [open, setOpen] = useState<Offer | null>(null);
  const [form, setForm] = useState(false);
  const query = useOffers();
  const names = useUserNames().data;
  const who = (id: string) => names?.get(id) ?? "";
  const { items, query: paged } = useLocalPaged(query, query.data ?? [], 25);
  return (
    <AdminPage title={t("admHub.mod.upsell.title")} subtitle={query.data ? t("ag6.offer.count", { n: query.data.length }) : undefined} right={canCreate ? <IconButton icon="plus" onPress={() => setForm(true)} label={t("ag6.offer.new")} /> : undefined}>
      <PagedList data={items} query={paged} keyExtractor={(o) => o.id} renderItem={(o) => <OfferRow item={o} who={who(o.clientId)} onPress={() => setOpen(o)} />} empty={{ icon: "trending-up", title: t("ag6.offer.empty") }} />
      <OfferSheet item={open} who={open ? who(open.clientId) : ""} onClose={() => setOpen(null)} />
      <OfferFormSheet visible={form} onClose={() => setForm(false)} />
    </AdminPage>
  );
}
