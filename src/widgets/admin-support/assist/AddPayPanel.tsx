import { useState } from "react";
import { settleRefunds, startRefund, type AssistContext, type AssistOrder, type RefundMap } from "@/entities/admin-support";
import { useAddPayLive } from "@/features/admin-support";
import { SectionCard } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { AddPayCard } from "./AddPayCard";
import { AddPaySheet } from "./AddPaySheet";
import type { ResolveAction } from "./addPayTypes";

type Props = { ctx: AssistContext; ticketId: string; canAct: boolean; onBlock: (e: unknown) => boolean };

// Supplemental payments of the client's orders (TZ 12): replace the options or start a refund. Refunds wait for Telegram.
export function AddPayPanel({ ctx, ticketId, canAct, onBlock }: Props) {
  const { t } = useT();
  const [refunds, setRefunds] = useState<RefundMap>({});
  const [open, setOpen] = useState<{ order: AssistOrder; action: ResolveAction } | null>(null);
  useAddPayLive(ticketId, (phase, keys) => {
    setRefunds((cur) => settleRefunds(cur, phase, keys));
    toast(t(`ntd.ccV2.pay.refund.${phase}`), phase === "approved" ? "ok" : "err");
  });
  const list = ctx.orders.filter((o) => o.addPay && (o.addPay.pending || refunds[o.addPay.requestId]));
  if (!list.length) return null;
  return (
    <>
      <SectionCard title={t("ntd.ccV2.pay.title")}>
        {list.map((o) => <AddPayCard key={o.id} order={o} refund={refunds[o.addPay?.requestId ?? ""]?.phase} canAct={canAct} onAction={(action) => setOpen({ order: o, action })} />)}
      </SectionCard>
      <AddPaySheet ticketId={ticketId} order={open?.order ?? null} action={open?.action ?? "replace_options"} onClose={() => setOpen(null)} onBlock={onBlock} onRefund={(o) => setRefunds((cur) => startRefund(cur, o.addPay?.requestId ?? "", o.id))} />
    </>
  );
}
