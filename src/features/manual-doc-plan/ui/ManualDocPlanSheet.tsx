import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { allowedPeriods, isGiftPlan, PERIODS, usePlans, type BillingPeriod } from "@/entities/plan";
import { PeriodChips, TelegramNotice, useTelegramRequest } from "@/features/choose-plan";
import { FormSheet } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel/Notice";
import { Skeleton, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { PlanPickList } from "./PlanPickList";

// Web "ManualDocPlanGate": template download / manual filling needs a plan with manual_document_fill.
// `message` (the server's 402 text, "" for a generic lead) opens it; null closes. Buying goes through a
// Telegram approval request; there is no pay-now step, only a pending receipt.
export function ManualDocPlanSheet({ message, onClose }: { message: string | null; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const open = message !== null;
  const lead = useKept(message);
  const plans = usePlans();
  const tg = useTelegramRequest();
  const [id, setId] = useState("");
  const [per, setPer] = useState<BillingPeriod>("monthly");
  useSheetReset(open, () => { setId(""); setPer("monthly"); tg.reset(); });
  const go = useSheetNavigate(onClose);
  const list = (plans.data ?? []).filter((p) => p.isActive && !isGiftPlan(p) && p.entitlements?.manual_document_fill === true);
  const sel = list.find((p) => p.id === id);
  const periods = tg.only ?? (sel ? allowedPeriods(sel) : PERIODS);
  const eff = periods.includes(per) ? per : periods[0];
  const none = !plans.isPending && !list.length;
  const act = tg.sent ? { label: t("tgp.tgClose"), run: onClose } : none ? { label: t("tgp.mdOpen"), run: () => go(() => router.push("/subscription")) } : { label: t(tg.pending ? "tgp.busy" : "tgp.mdSubmit"), run: () => sel && tg.send(sel.id, eff) };
  return (
    <FormSheet visible={open} onClose={onClose} title={t("tgp.mdTitle")} submitLabel={act.label} onSubmit={plans.isPending ? undefined : act.run} submitting={tg.pending} disabled={!tg.sent && !none && !sel}>
      <View style={{ gap: 14 }}>
        <Text variant="small" tone="gray">{lead || t("tgp.mdLead")}</Text>
        {tg.sent ? <Notice tone="ok" text={t("tgp.mdSent")} /> : plans.isPending ? <Skeleton height={200} round={20} /> : none ? <Text variant="small" tone="gray">{t("tgp.mdNone")}</Text> : (
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
