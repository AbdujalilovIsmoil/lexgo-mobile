import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { usePending, usePromotionLive } from "@/entities/promotion";
import { ServiceRow, useProServices, type ProService } from "@/entities/pro-service";
import { useSession } from "@/entities/session";
import { ServiceFormSheet } from "@/features/pro-service-form";
import { ServiceSheet } from "@/features/pro-service-actions";
import { ServicesHeader, type ServiceFilter } from "@/widgets/pro-service";
import { IconButton } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { afterSheet } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Sheet = { kind: "view" | "form"; item: ProService | null; open: boolean };
const RANK = { active: 0, paused: 1, inactive: 2 } as const;

// The seller's services (GET/POST/PATCH/DELETE /lawyers/me/services/manage): list, add / edit with the price corridor, status, promote.
export default function ProServicesPage() {
  const { t } = useT();
  const router = useRouter();
  const q = useProServices();
  const uid = useSession()?.user.id ?? "";
  const waitingFor = new Set(usePending(uid).pending.map((p) => p.target));
  usePromotionLive(uid);
  const [filter, setFilter] = useState<ServiceFilter>("all");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<Sheet>({ kind: "view", item: null, open: false });
  const close = () => setSheet((x) => ({ ...x, open: false }));
  const d = q.data;
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (d?.items ?? [])
      .filter((x) => (filter === "all" || x.status === filter) && (!term || `${x.name} ${x.categoryTitle} ${x.note}`.toLowerCase().includes(term)))
      .sort((a, b) => RANK[a.status] - RANK[b.status] || a.name.localeCompare(b.name));
  }, [d, filter, search]);
  const open = (kind: "view" | "form", item: ProService | null) => setSheet({ kind, item, open: true });
  const boost = d?.items.find((x) => x.profileBoost)?.profileBoost ?? null;
  return (
    <AdminPage title={t("nav1.menu.proServices")} right={<IconButton icon="list" onPress={() => open("form", null)} />}>
      <PagedList
        data={shown}
        query={q}
        keyExtractor={(x) => x.id}
        renderItem={(x) => <ServiceRow item={x} waiting={waitingFor.has(`service:${x.id}`)} onPress={() => open("view", x)} />}
        empty={{ icon: "briefcase", title: t("sl6.empty"), text: t("ntd.sellerV2.svc.emptyText") }}
        header={<ServicesHeader items={d?.items ?? []} filter={filter} onFilter={setFilter} search={search} onSearch={setSearch} verified={d?.verified ?? true} boostDays={boost ? boost.daysLeft : null} />}
      />
      <ServiceSheet item={sheet.open && sheet.kind === "view" ? sheet.item : null} verified={d?.verified ?? true} onClose={close} onEdit={(s) => { close(); afterSheet(() => open("form", s)); }} onPromote={(s) => { close(); afterSheet(() => router.push({ pathname: "/pro/promotions/new", params: { service: s.id } } as never)); }} />
      <ServiceFormSheet visible={sheet.open && sheet.kind === "form"} onClose={close} item={sheet.kind === "form" ? sheet.item : null} taken={new Set((d?.items ?? []).map((x) => x.id))} sellerId={d?.sellerId ?? ""} region={d?.region ?? ""} yurist={d?.sellerType === "yurist"} />
    </AdminPage>
  );
}
