import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { usePending, usePromotionLive } from "@/entities/promotion";
import { ServiceRow, filterServices, useProServices, useServiceStatus, type ProSeller, type ProService, type ServiceFilter, type ServiceStatus } from "@/entities/pro-service";
import { ConfigPanel } from "@/entities/pro-service/config";
import { RulesBanner, useRulesGate } from "@/entities/service-rules";
import { useSession } from "@/entities/session";
import { ServiceFormSheet } from "@/features/pro-service-form";
import { ServiceSheet } from "@/features/pro-service-actions";
import { ServicesEmpty, ServicesHeader, ServicesTabs, useServicesTab } from "@/widgets/pro-service";
import { useInsets } from "@/shared/lib/insets";
import { IconButton } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { afterSheet } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

const BLANK: ProSeller = { name: "", avatarUrl: "", kind: "yurist", verified: false, rating: 0, reviews: 0, experienceYears: 0, cases: 0, successRate: 0, completed: null, about: { bio: "", district: "", languages: [], specializations: [], education: "", license: "", bar: "", organization: "" } };
type Sheet = { kind: "view" | "form"; item: ProService | null; open: boolean };

// Integration slots: `packages` is the content of the "Paketlar" tab, `aboveList` sits right under the hero (location-sharing card).
type Props = { packages?: ReactNode; aboveList?: ReactNode };

// The seller's services (GET/POST/PATCH/DELETE /lawyers/me/services/manage): list, add / edit with the price corridor, status, promote.
// Service rules (accept them before a service can be switched on) and the marketplace configuration (negotiation, price explanation) plug into the sheet slots.
export default function ProServicesPage({ packages, aboveList }: Props = {}) {
  const { t } = useT();
  const insets = useInsets();
  const [tab, setTab] = useServicesTab();
  const router = useRouter();
  const q = useProServices();
  const gate = useRulesGate();
  const statusChange = useServiceStatus();
  // The card switch: on needs the rules accepted (it opens them instead), off pauses.
  const toggle = (x: ProService, next: ServiceStatus) => (next === "active" && gate.blocked ? gate.open() : statusChange.mutate({ id: x.id, status: next }));
  const uid = useSession()?.user.id ?? "";
  const pending = usePending(uid).pending;
  const waitingFor = new Set(pending.map((p) => p.target));
  usePromotionLive(uid);
  const [filter, setFilter] = useState<ServiceFilter>("all");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<Sheet>({ kind: "view", item: null, open: false });
  const close = () => setSheet((x) => ({ ...x, open: false }));
  const d = q.data;
  const refetch = q.refetch;
  const seen = useRef(gate.pending);
  useEffect(() => {
    if (seen.current === gate.pending) return;
    seen.current = gate.pending;
    void refetch(); // services that were switched on come back on their own once the rules are accepted
  }, [gate.pending, refetch]);
  const shown = useMemo(() => filterServices(d?.items ?? [], filter, search), [d, filter, search]);
  // The sheet shows the live service of the list (not the copy taken when it opened), so a status change moves its switch at once.
  const viewing = sheet.open && sheet.kind === "view" ? ((d?.items ?? []).find((x) => x.id === sheet.item?.id) ?? sheet.item) : null;
  const open = (kind: "view" | "form", item: ProService | null) => setSheet({ kind, item, open: true });
  const boost = d?.items.find((x) => x.profileBoost)?.profileBoost ?? null;
  const verified = d?.verified ?? true;
  const promote = (service?: string) => router.push((service ? { pathname: "/pro/promotions/new", params: { service } } : "/pro/promotions") as never);
  const none = !q.isLoading && !q.isError && (d?.items.length ?? 0) === 0;
  const tabs = <ServicesTabs value={tab} onChange={setTab} />;
  const header = (toolbar: boolean) => (
    <ServicesHeader before={tabs} aboveList={aboveList} rules={<RulesBanner onOpen={gate.open} />} items={d?.items ?? []} loading={q.isLoading} filter={filter} onFilter={setFilter} search={search} onSearch={setSearch} verified={verified} boostDays={boost ? boost.daysLeft : null} waiting={pending.length} toolbar={toolbar} onAdd={() => open("form", null)} onPromoteProfile={() => promote()} />
  );
  return (
    <AdminPage title={t("proSvc.title")} right={<IconButton icon="refresh-cw" label={t("proSvc.refresh")} onPress={() => void q.refetch()} />}>
      {tab === "packages" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 14 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {tabs}
          {packages ?? null}
        </ScrollView>
      ) : none ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}>
          {header(false)}
          <ServicesEmpty onAdd={() => open("form", null)} />
        </ScrollView>
      ) : (
        <PagedList
          data={shown}
          query={q}
          keyExtractor={(x) => x.id}
          renderItem={(x) => <ServiceRow item={x} waiting={waitingFor.has(`service:${x.id}`)} onPress={() => open("view", x)} onToggle={(next) => toggle(x, next)} toggleDisabled={statusChange.isPending} />}
          empty={{ icon: "search", title: t("proSvc.empty.filtered"), text: t("proSvc.empty.filteredText"), actionLabel: t("proSvc.filter.reset"), onAction: () => { setFilter("all"); setSearch(""); } }}
          header={header(true)}
        />
      )}
      <ServiceSheet item={viewing} verified={verified} waiting={sheet.item ? waitingFor.has(`service:${sheet.item.id}`) : false} lock={gate.blocked ? { reason: t("svcRules.rulesLockReason"), actionLabel: t("svcRules.rulesLockAction"), onOpen: () => { close(); afterSheet(gate.open); } } : null} extra={(x) => <ConfigPanel serviceId={x.id} status={x.status} negotiationAllowed={null} onSaved={() => void refetch()} />} onClose={close} onEdit={(s) => { close(); afterSheet(() => open("form", s)); }} onPromote={(s) => { close(); afterSheet(() => promote(s.id)); }} />
      <ServiceFormSheet visible={sheet.open && sheet.kind === "form"} onClose={close} item={sheet.kind === "form" ? sheet.item : null} taken={new Set((d?.items ?? []).map((x) => x.id))} sellerId={d?.sellerId ?? ""} region={d?.region ?? ""} yurist={d?.sellerType === "yurist"} seller={d?.seller ?? BLANK} services={d?.items ?? []} />
      {gate.sheet}
    </AdminPage>
  );
}
