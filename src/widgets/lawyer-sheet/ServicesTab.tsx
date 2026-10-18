import { StyleSheet, View } from "react-native";
import { useLawyerServices, type Lawyer, type LawyerService } from "@/entities/lawyer";
import { EmptyState, ErrorView, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SafeDeal } from "./SafeDeal";
import { ServiceRow } from "./ServiceRow";

type Props = { lawyer: Lawyer; blocked: string; authed: boolean; onBuy: (s: LawyerService) => void; onExplain: () => void };

// Services he sells now (GET …/services, fresher than the profile copy).
export function ServicesTab({ lawyer, blocked, authed, onBuy, onExplain }: Props) {
  const { t } = useT();
  const q = useLawyerServices(lawyer.userId);
  const list = q.data ?? lawyer.services;
  if (q.isLoading && !lawyer.services.length) return <View style={s.col}>{[0, 1, 2].map((i) => <Skeleton key={i} height={110} round={20} />)}</View>;
  if (q.isError && !list.length) return <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  if (!list.length) return <EmptyState icon="briefcase" title={t("mk2.noServices")} compact />;
  return (
    <View style={s.col}>
      <Text variant="small" tone="gray">{t("mk2.servicesLead")}</Text>
      <PressableScale onPress={onExplain} style={s.link} accessibilityRole="button"><Text variant="small" weight="bold" tone="accent">{t("mk2.explain.open")}</Text></PressableScale>
      {list.map((sv) => <ServiceRow key={sv.id} service={sv} disabled={!!blocked} label={authed ? t("mk2.buy") : t("mk2.loginToBuy")} onBuy={() => onBuy(sv)} />)}
      {blocked ? <Text variant="small" tone="warn">{blocked}</Text> : null}
      <SafeDeal />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  link: { alignSelf: "flex-start" },
});
