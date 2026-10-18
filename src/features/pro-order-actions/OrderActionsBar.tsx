import { useState } from "react";
import { useKept } from "@/shared/lib/useKept";
import { View } from "react-native";
import { actionsOf, useAcceptOrder, useMoveOrder, type ProOrder } from "@/entities/pro-order";
import { AdditionalSheet } from "@/features/pro-order-additional";
import { CompleteSheet } from "@/features/pro-order-complete";
import { Button, type IconName } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { DeclineSheet } from "./DeclineSheet";
import { NoteSheet } from "./NoteSheet";

type Step = { kind: "move"; status: string } | { kind: "complete" } | { kind: "extra" } | null;
type Act = { key: string; label: string; icon: IconName; danger?: boolean; onPress: () => void };

// The next actions the order's status allows (accept · progress moves · complete · decline). The first is the
// big button, the rest sit under "More". The server has the last word (409 / 403 are shown as toasts).
export function OrderActionsBar({ order, acceptAllowed }: { order: ProOrder; acceptAllowed: boolean }) {
  const { t } = useT();
  const a = actionsOf(order, acceptAllowed);
  const [step, setStep] = useState<Step>(null);
  const shown = useKept(step);
  const [more, setMore] = useState(false);
  const [declining, setDeclining] = useState(false);
  const accept = useAcceptOrder();
  const move = useMoveOrder();
  const acts: Act[] = [
    ...(a.accept ? [{ key: "accept", label: t("sl9.accept"), icon: "check" as const, onPress: () => accept.mutate(order.id) }] : []),
    ...a.moves.map((s) => ({ key: s, label: t(`sl12.move.${s}`), icon: "arrow-right-circle" as const, onPress: () => setStep({ kind: "move", status: s }) })),
    ...(a.complete ? [{ key: "complete", label: t("sl9.complete"), icon: "check-circle" as const, onPress: () => setStep({ kind: "complete" }) }] : []),
    ...(a.extra ? [{ key: "extra", label: t("ntd.sellerV2.add.button"), icon: "plus-circle" as const, onPress: () => setStep({ kind: "extra" }) }] : []),
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
      <NoteSheet
        visible={step?.kind === "move"}
        onClose={() => setStep(null)}
        title={shown?.kind === "move" ? t(`sl12.move.${shown.status}`) : ""}
        text={t("sl9.moveText")}
        submitLabel={t("adm.confirm")}
        submitting={move.isPending}
        onSubmit={(note) => step?.kind === "move" && move.mutate({ id: order.id, status: step.status, note }, { onSuccess: () => setStep(null) })}
      />
      <CompleteSheet order={order} visible={step?.kind === "complete"} onClose={() => setStep(null)} />
      <AdditionalSheet order={order} visible={step?.kind === "extra"} onClose={() => setStep(null)} />
    </View>
  );
}
