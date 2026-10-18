import { View } from "react-native";
import { expiryOf, type AssistOrder, type RefundPhase } from "@/entities/admin-support";
import { Button, Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ResolveAction } from "./addPayTypes";
import { useSum } from "./useSum";

type Props = { order: AssistOrder; refund?: RefundPhase; canAct: boolean; onAction: (a: ResolveAction) => void };
const ACTIONS: ResolveAction[] = ["replace_options", "full_refund", "partial_refund"];

// One supplemental-payment request: order, amount, the 24 h clock (21 h warning), selected options and the operator's choices.
export function AddPayCard({ order: o, refund, canAct, onAction }: Props) {
  const { t } = useT();
  const sum = useSum();
  const a = o.addPay;
  if (!a) return null;
  const ex = expiryOf(a);
  const left = Math.max(1, Math.ceil(ex.msLeft / 3_600_000));
  return (
    <Card tinted style={{ gap: 8 }}>
      <Text variant="body" weight="bold">{[o.workId, o.title].filter(Boolean).join(" · ")}</Text>
      {a.amount > 0 ? <Text variant="small">{t("ntd.ccV2.pay.amount")}: {sum(a.amount, a.currency)}</Text> : null}
      {a.selectedIds.length ? <Text variant="caption" tone="gray">{t("ntd.ccV2.pay.options")}: {a.selectedIds.join(", ")}</Text> : null}
      {ex.state === "expired" ? <Text variant="small" tone="err">{t("ntd.ccV2.pay.expired")}</Text> : null}
      {ex.state === "warn" ? <Text variant="small" tone="warn">{t("ntd.ccV2.pay.warn", { h: left })}</Text> : null}
      {ex.state === "ok" ? <Text variant="caption" tone="gray">{t("ntd.ccV2.pay.left", { h: left })}</Text> : null}
      {refund ? <Text variant="small" weight="bold" tone={refund === "rejected" ? "err" : refund === "approved" ? "ok" : "warn"}>{t(`ntd.ccV2.pay.refund.${refund}`)}</Text> : null}
      {canAct && refund !== "waiting" && refund !== "approved" ? (
        <View style={{ gap: 6 }}>{ACTIONS.map((x) => <Button key={x} title={t(`ntd.ccV2.pay.act.${x}`)} variant={x === "replace_options" ? "soft" : "line"} size="sm" onPress={() => onAction(x)} />)}</View>
      ) : null}
    </Card>
  );
}
