import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { allowedPeriods, CampaignLine, featureKeys, GateNotice, isGiftPlan, liftsGate, PERIODS, useEntitlements, useGateText, useMyFeatures, usePlans, type BillingPeriod, type PlanGate } from "@/entities/plan";
import { PeriodChips, TelegramNotice, useTelegramRequest } from "@/features/choose-plan";
import { FormSheet } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel/Notice";
import { Skeleton, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { fmtMoney } from "@/shared/lib/money";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { PlanPickList } from "./PlanPickList";

const CLOSED: PlanGate = { code: "plan_required", featureKey: "", limit: null, used: null, remaining: null, unit: "", resetsAt: "", message: "" };

// The plan stopped a paid action (its 402, or the backend's feature state before trying): the reason for the backend's code — for a used-up
// limit the meter, used / limit and the reset date — then the tariffs whose current contract lifts it (the gate's feature, a bigger limit for
// a used-up one) to request in place through Telegram, and always the way to the tariffs page. `gate` null closes it.
export function PlanGateSheet({ gate, onClose }: { gate: PlanGate | null; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const open = gate !== null;
  const g = useKept(gate) ?? CLOSED;
  const words = useGateText(g);
  const plans = usePlans();
  const ent = useEntitlements().data;
  const mineId = useMyFeatures().data?.planId;
  const tg = useTelegramRequest();
  const [id, setId] = useState("");
  const [per, setPer] = useState<BillingPeriod>("monthly");
  useSheetReset(open, () => { setId(""); setPer("monthly"); tg.reset(); });
  // The backend has just refused on the plan's grounds: the features it reports (counters, locks) are read again for every screen.
  useEffect(() => { if (open) void qc.invalidateQueries({ queryKey: featureKeys.mine }); }, [open, qc]);
  const go = useSheetNavigate(onClose);
  const toPlans = () => go(() => router.push("/subscription"));
  // The client's own tariffs are left out: the one that stopped the action cannot lift it.
  const mine = new Set([...(ent?.planIds ?? []), mineId ?? ""]);
  const list = (plans.data ?? []).filter((p) => p.isActive && !isGiftPlan(p) && p.monthlyPrice > 0 && !mine.has(p.id) && liftsGate(p, g));
  const sel = list.find((p) => p.id === id);
  const periods = tg.only ?? (sel ? allowedPeriods(sel) : PERIODS);
  const eff = periods.includes(per) ? per : periods[0];
  const none = !plans.isPending && !list.length;
  const sent = tg.sent;
  const bar = sent
    ? { label: t("tgp.tgClose"), run: onClose }
    : none ? { label: t("subq.gate.open"), run: toPlans } : { label: t(tg.pending ? "tgp.busy" : "tgp.mdSubmit"), run: () => sel && tg.send(sel.id, eff) };
  return (
    <FormSheet visible={open} onClose={onClose} title={words.title} submitLabel={bar.label} onSubmit={plans.isPending ? undefined : bar.run} submitting={tg.pending}
      disabled={!sent && !none && !sel} secondary={!sent && !none ? { label: t("subq.gate.plans"), onPress: toPlans } : undefined}>
      <View style={{ gap: 14 }}>
        <GateNotice gate={g} />
        {sent ? (
          <>
            <Notice tone="ok" text={t("subq.gate.sent")} />
            {sent.pricing ? (
              <View style={{ gap: 6 }}>
                <Text variant="small" tone="gray">{t("tgp.tgAmount")}: <Text variant="small" weight="bold">{fmtMoney(sent.pricing.amount)} {t("common.currency")}</Text></Text>
                {sent.pricing.discount > 0 ? <CampaignLine quote={sent.pricing} /> : null}
              </View>
            ) : null}
          </>
        ) : plans.isPending ? <Skeleton height={200} round={20} /> : none ? <Text variant="small" tone="gray">{t("subq.gate.none")}</Text> : (
          <>
            <PlanPickList plans={list} period={eff} picked={id} onPick={setId} />
            <PeriodChips label={t("tgp.mdPeriod")} periods={periods} value={eff} onChange={setPer} />
            <TelegramNotice problem={tg.problem} detail={tg.detail} gate />
          </>
        )}
      </View>
    </FormSheet>
  );
}
