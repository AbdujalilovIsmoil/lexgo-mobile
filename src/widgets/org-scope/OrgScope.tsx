import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useOrgRealtime, type Organization } from "@/entities/organization";
import { OrgFormSheet } from "@/features/org-create";
import { OrgSwitchSheet, useCurrentOrg } from "@/features/org-switch";
import { OrgBar } from "./OrgBar";

type Props = { title: string; subtitle?: string; right?: (org: Organization) => ReactNode; children: (org: Organization) => ReactNode };

// Frame of every /org screen: loads the owner's organizations, shows the switch bar, and offers to register one
// when there is none. Children only ever see an organization the signed-in user owns (TZ 3.5 data isolation).
export function OrgScope({ title, subtitle, right, children }: Props) {
  const { t } = useT();
  const { query, orgs, current, select } = useCurrentOrg();
  useOrgRealtime();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  let body: ReactNode;
  if (query.isLoading) body = <View style={{ padding: 16, gap: 12 }}><Skeleton height={54} round={16} /><Skeleton height={120} round={20} /><Skeleton height={120} round={20} /></View>;
  else if (query.isError) body = <ErrorView error={query.error} onRetry={() => void query.refetch()} />;
  else if (!current) body = <EmptyState icon="briefcase" title={t("og1.empty")} text={t("og1.emptyText")} actionLabel={t("og1.create")} onAction={() => setCreateOpen(true)} />;
  else body = <><OrgBar org={current} onPress={() => setSwitchOpen(true)} /><View style={{ flex: 1 }}>{children(current)}</View></>;
  return (
    <AdminPage title={title} subtitle={subtitle} right={current ? right?.(current) : undefined}>
      {body}
      <OrgSwitchSheet visible={switchOpen} orgs={orgs} currentId={current?.id ?? ""} onPick={select} onCreate={() => { setSwitchOpen(false); setTimeout(() => setCreateOpen(true), 340); }} onClose={() => setSwitchOpen(false)} />
      <OrgFormSheet visible={createOpen} onClose={() => setCreateOpen(false)} onCreated={select} />
    </AdminPage>
  );
}
