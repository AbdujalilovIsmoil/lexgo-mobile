import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { BottomSheet, SheetScroll } from "@/shared/ui/sheet";
import { Button, EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { deviceLabel } from "@/entities/session/lib/deviceLabel";
import { orderRules } from "../lib/normalize";
import { useAcceptRule, useServiceRules } from "../model/queries";
import type { ServiceRule } from "../model/types";
import { RuleCard } from "./RuleCard";

type Props = { visible: boolean; onClose: () => void; serviceId?: string; focus?: string[]; extra?: ServiceRule[] };

// Bottom sheet with the rules the seller has to accept — of one service (the ones its configuration or a refusal named come
// first, `focus`) or all of them; accepting writes the device label (web drawer). Ten rules at a time.
export function RulesSheet({ visible, onClose, serviceId, focus = [], extra = [] }: Props) {
  const { t } = useT();
  const q = useServiceRules(serviceId, visible);
  const accept = useAcceptRule();
  const rules = q.data ? orderRules(q.data.items, focus, extra) : [];
  const pending = rules.filter((r) => !r.accepted).length;
  const page = useShowMore(rules, `${serviceId ?? ""}|${focus.join(",")}`);
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
        ) : !rules.length ? (
          <EmptyState icon="file-text" title={t("svcRules.rulesEmpty")} compact />
        ) : (
          <>
            <Text variant="h4" tone={pending ? "warn" : "ok"} accessibilityRole="summary">{pending ? t("svcRules.rulesSummaryPending", { n: pending }) : t("svcRules.rulesSummaryDone")}</Text>
            {page.visible.map((r) => (
              <RuleCard key={r.id || r.key || r.title} rule={r} named={focus.includes(r.id)} busy={busyId === r.id} locked={accept.isPending} onAccept={(x) => accept.mutate(x)} />
            ))}
            <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
            {pending ? <Text variant="caption" tone="gray">{t("svcRules.rulesDeviceNote", { device: deviceLabel() })}</Text> : null}
          </>
        )}
        <Button title={t("svcRules.rulesDone")} variant="soft" onPress={onClose} full />
      </SheetScroll>
    </BottomSheet>
  );
}
