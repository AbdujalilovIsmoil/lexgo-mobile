import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { BottomSheet, SheetScroll } from "@/shared/ui/sheet";
import { Button, EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { deviceLabel } from "@/entities/session/lib/deviceLabel";
import { pendingCount } from "../lib/normalize";
import { useAcceptRule, useServiceRules } from "../model/queries";
import { RuleCard } from "./RuleCard";

type Props = { visible: boolean; onClose: () => void; serviceId?: string };

// Bottom sheet with every rule the seller has to accept; accepting writes the device label (web drawer).
export function RulesSheet({ visible, onClose, serviceId }: Props) {
  const { t } = useT();
  const q = useServiceRules(serviceId);
  const accept = useAcceptRule();
  const pending = pendingCount(q.data);
  const busyId = accept.isPending ? accept.variables?.id : "";
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("svcRules.rulesDrawerTitle")} snaps={[0.7, 0.94]}>
      <SheetScroll>
        <Text variant="small" tone="gray">{t("svcRules.rulesDrawerLead")}</Text>
        {q.isPending ? (
          <View style={{ gap: 12 }} accessibilityLabel={t("svcRules.rulesChecking")}>
            <Skeleton height={150} round={20} />
            <Skeleton height={150} round={20} />
          </View>
        ) : q.isError ? (
          <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
        ) : !q.data.items.length ? (
          <EmptyState icon="file-text" title={t("svcRules.rulesEmpty")} compact />
        ) : (
          <>
            <Text variant="h4" tone={pending ? "warn" : "ok"} accessibilityRole="summary">{pending ? t("svcRules.rulesSummaryPending", { n: pending }) : t("svcRules.rulesSummaryDone")}</Text>
            {q.data.items.map((r) => (
              <RuleCard key={r.id || r.key || r.title} rule={r} busy={busyId === r.id} locked={accept.isPending} onAccept={(x) => accept.mutate(x)} />
            ))}
            {pending ? <Text variant="caption" tone="gray">{t("svcRules.rulesDeviceNote", { device: deviceLabel() })}</Text> : null}
          </>
        )}
        <Button title={t("svcRules.rulesDone")} variant="soft" onPress={onClose} full />
      </SheetScroll>
    </BottomSheet>
  );
}
