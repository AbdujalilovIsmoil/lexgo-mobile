import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { ChipBar, PagedList } from "@/shared/ui/admin";
import { ApiError } from "@/shared/api";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { ServiceCard, useMemberServices, type ManagedService, type OrgMember } from "@/entities/organization";
import { PromoteSheet, ServiceActions } from "@/features/org-service-actions";
import { ServiceFormSheet } from "@/features/org-service-form";

type Filter = "all" | "active" | "paused" | "inactive";
type Props = { orgId: string; member: OrgMember; lead: ReactElement };

// The member's marketplace services: price inside the allowed range, status, visibility, promotion (owner can manage all).
export function MemberServices({ orgId, member, lead }: Props) {
  const { t } = useT();
  const q = useMemberServices(orgId, member.userId);
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<{ item: ManagedService | null } | null>(null);
  const [promo, setPromo] = useState<ManagedService | null>(null);
  const keptForm = useKept(form);
  const keptPromo = useKept(promo);
  const d = q.data;
  const notSeller = q.error instanceof ApiError && q.error.status === 404;
  const items = (d?.items ?? []).filter((i) => filter === "all" || i.status === filter);
  const count = (f: Filter) => (d?.items ?? []).filter((i) => f === "all" || i.status === f).length;
  const can = d?.canManage !== false;
  return (
    <>
      <PagedList
        data={items}
        query={notSeller ? { ...q, isError: false } : q}
        keyExtractor={(i) => i.id}
        skeletonHeight={150}
        renderItem={(i) => (
          <ServiceCard item={i} verified={d?.verified ?? false}>
            {can ? <ServiceActions orgId={orgId} memberId={member.userId} item={i} onEdit={() => setForm({ item: i })} onPromote={() => setPromo(i)} /> : null}
          </ServiceCard>
        )}
        empty={{ icon: "briefcase", title: notSeller ? t("og5.notSeller") : t("og5.empty"), text: notSeller ? t("og5.notSellerText") : t("og5.emptyText") }}
        header={
          <View style={{ gap: 10, marginBottom: 12 }}>
            {lead}
            {d && !d.verified ? <Text variant="small" tone="warn">{t("og5.unverified")}</Text> : null}
            {d && can ? <Button title={t("ntd.sellerV2.svc.pickBtn")} icon="list" variant="gradient" full onPress={() => setForm({ item: null })} /> : null}
            {d?.items.length ? <View style={{ marginHorizontal: -16 }}><ChipBar value={filter} onChange={setFilter} options={(["all", "active", "paused", "inactive"] as Filter[]).map((f) => ({ value: f, label: f === "all" ? t("adm.all") : t(`og5.status.${f}`), count: count(f) }))} /></View> : null}
          </View>
        }
      />
      <ServiceFormSheet visible={!!form} orgId={orgId} memberId={member.userId} seller={d ?? null} item={keptForm?.item ?? null} taken={new Set((d?.items ?? []).map((i) => i.id))} onClose={() => setForm(null)} />
      <PromoteSheet visible={!!promo} orgId={orgId} memberId={member.userId} item={keptPromo} onClose={() => setPromo(null)} />
    </>
  );
}
