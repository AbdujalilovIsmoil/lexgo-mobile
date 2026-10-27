import { useState } from "react";
import { View } from "react-native";
import { actionsOf, type ProOrder } from "@/entities/pro-order";
import { AdditionalSheet } from "@/features/pro-order-additional";
import { CompleteSheet } from "@/features/pro-order-complete";
import { CancelRequestSheet, ReviewDurationSheet, StartWorkSheet, useAnswer } from "@/features/market-flow";
import { Button, type IconName } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { DeclineSheet } from "./DeclineSheet";

type Step = { kind: "start" } | { kind: "review" } | { kind: "complete" } | { kind: "extra" } | { kind: "cancel" } | null;
type Act = { key: string; label: string; icon: IconName; danger?: boolean; onPress: () => void };

// The next actions the backend allows (accept · start · set the delivery time after the review · complete · supplemental payment ·
// request cancellation · decline). The first is the big button, the rest sit under "More". The server has the last word: a TZ code is
// explained in words and a 409 re-reads the order.
export function OrderActionsBar({ order, acceptAllowed, onShowItem }: { order: ProOrder; acceptAllowed: boolean; onShowItem?: (itemId: string) => void }) {
  const { t } = useT();
  const a = actionsOf(order, acceptAllowed);
  const [step, setStep] = useState<Step>(null);
  const [more, setMore] = useState(false);
  const [declining, setDeclining] = useState(false);
  const accept = useAnswer(order.id, { inPlace: false }).accept;
  const acts: Act[] = [
    ...(a.accept ? [{ key: "accept", label: t("sl9.accept"), icon: "check" as const, onPress: () => accept.mutate(undefined) }] : []),
    ...(a.start ? [{ key: "start", label: t("mf.start.button"), icon: "play-circle" as const, onPress: () => setStep({ kind: "start" }) }] : []),
    ...(a.review ? [{ key: "review", label: t("mf.rv.action"), icon: "calendar" as const, onPress: () => setStep({ kind: "review" }) }] : []),
    ...(a.complete ? [{ key: "complete", label: t("sl9.complete"), icon: "check-circle" as const, onPress: () => setStep({ kind: "complete" }) }] : []),
    ...(a.extra ? [{ key: "extra", label: t("ntd.sellerV2.add.button"), icon: "plus-circle" as const, onPress: () => setStep({ kind: "extra" }) }] : []),
    ...(a.cancelRequest ? [{ key: "cancel", label: t("mf.cr.button"), icon: "slash" as const, danger: true, onPress: () => setStep({ kind: "cancel" }) }] : []),
    ...(a.decline ? [{ key: "decline", label: t("sl9.decline"), icon: "x-circle" as const, danger: true, onPress: () => setDeclining(true) }] : []),
  ];
  if (!acts.length) return null;
  const [main, ...rest] = acts;
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Button title={main.label} icon={main.icon} variant={main.danger ? "line" : "primary"} loading={main.key === "accept" && accept.isPending} onPress={main.onPress} style={{ flex: 1 }} />
      {rest.length ? <Button title={t("sl9.more")} variant="line" icon="more-horizontal" onPress={() => setMore(true)} /> : null}
      <ActionList visible={more} onClose={() => setMore(false)} title={t("sl9.more")} actions={rest} />
      <DeclineSheet order={order} visible={declining} onClose={() => setDeclining(false)} />
      <StartWorkSheet visible={step?.kind === "start"} onClose={() => setStep(null)} orderId={order.id} startUrl={order.flow.startUrl} />
      <ReviewDurationSheet visible={step?.kind === "review"} onClose={() => setStep(null)} orderId={order.id} />
      <CancelRequestSheet visible={step?.kind === "cancel"} onClose={() => setStep(null)} orderId={order.id} />
      <CompleteSheet order={order} visible={step?.kind === "complete"} onClose={() => setStep(null)} onShowItem={onShowItem} />
      <AdditionalSheet order={order} visible={step?.kind === "extra"} onClose={() => setStep(null)} />
    </View>
  );
}
