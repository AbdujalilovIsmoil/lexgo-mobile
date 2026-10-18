import { RefreshControl, ScrollView } from "react-native";
import { useReferral } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { fmtMoney } from "@/shared/lib/money";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { CodeCard } from "./CodeCard";
import { Invites } from "./Invites";
import { Ladder } from "./Ladder";

// Referral screen body: code / link / QR, counters, commission ladder, how it works, invitations.
export function ReferralPanel() {
  const { t } = useT();
  const insets = useInsets();
  const q = useReferral();
  if (q.isError) return <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const r = q.data;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 40 }} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />} showsVerticalScrollIndicator={false}>
      {r ? <CodeCard r={r} /> : <Skeleton height={220} round={20} />}
      <KpiGrid>
        <KpiTile loading={!r} icon="send" label={t("aw10.invited")} value={String(r?.invited ?? 0)} />
        <KpiTile loading={!r} icon="user-check" label={t("aw10.joined")} value={String(r?.joined ?? 0)} />
        <KpiTile loading={!r} icon="gift" tint="#22C55E" label={t("aw10.reward")} value={`${fmtMoney(r?.reward ?? 0)} ${t("adm.currency")}`} />
      </KpiGrid>
      {r ? <Ladder joined={r.joined} /> : null}
      <Text variant="h4">{t("aw10.how")}</Text>
      {(["step1", "step2", "step3"] as const).map((k, i) => <Text key={k} variant="small" tone="gray">{`${i + 1}. ${t(`aw10.${k}`)}`}</Text>)}
      <Text variant="h4">{t("aw10.invites")}</Text>
      <Invites items={r?.items ?? []} />
    </ScrollView>
  );
}
