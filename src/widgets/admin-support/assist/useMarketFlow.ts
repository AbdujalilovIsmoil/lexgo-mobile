import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { resultKey, useRequestMarket, type Seller } from "@/entities/admin-support";
import type { Fact } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { marketSchema } from "./assistSchemas";
import { useAssistStep } from "./AssistFormSheet";
import type { FlowProps } from "./flowTypes";
import { useAssistError } from "./useAssistError";
import { useMarketPick } from "./useMarketPick";
import { useMarketQuote } from "./useMarketQuote";
import { useSum } from "./useSum";

const EMPTY = { q: "", serviceId: "", channel: "chat", time: "", note: "" };

// Marketplace purchase request: service OR package tier → seller → options + backend quote → Telegram approval.
export function useMarketFlow({ ticketId, client, clientName, visible, onClose, onSent, onBlock }: FlowProps) {
  const { t } = useT();
  const sum = useSum();
  const errText = useAssistError();
  const form = useAppForm(marketSchema, EMPTY);
  const v = form.watch();
  const [err, setErr] = useState("");
  const step = useAssistStep();
  const req = useRequestMarket(ticketId);
  const p = useMarketPick(useDebounced(v.q.trim(), 350), visible);
  const { seller, pkg, isPkg } = p;
  const items = p.svcQ.data?.length ? p.svcQ.data : (seller?.services ?? []);
  const service = isPkg ? null : (items.find((s) => s.id === v.serviceId) ?? (items.length === 1 ? items[0] : null));
  const { opts, quote, target } = useMarketQuote({ isPkg, seller, serviceId: service?.id ?? "", pkg });
  const set = (patch: Partial<typeof EMPTY>) => { for (const k of Object.keys(patch) as (keyof typeof EMPTY)[]) form.setValue(k, patch[k] as never); setErr(""); };
  const pickSeller = (s: Seller | null) => { p.setSeller(s); set({ serviceId: "" }); quote.clear(); };
  const pickService = (serviceId: string) => { set({ serviceId }); quote.clear(); };
  const pickKind = (k: typeof p.kind) => { p.setKind(k); p.setPkg(null); pickSeller(null); };
  const pickPkg = (x: typeof pkg) => { p.setPkg(x); pickSeller(null); };
  const close = () => { step.reset(); pickKind("service"); form.reset(EMPTY); setErr(""); onClose(); };
  const total = quote.quote?.totalPrice ?? 0;
  const title = isPkg ? pkg?.title : service?.title;

  const review = () => {
    if (!seller) return setErr(t("admSupC.market.sellerRequired"));
    if (!target) return setErr(t(isPkg ? "ntd.ccV2.market.pkgRequired" : "admSupC.market.serviceRequired"));
    if (!quote.settled) return setErr(quote.error || t("ntd.po.calc"));
    void form.handleSubmit(() => step.review())();
  };
  const submit = () => {
    if (!seller || !target || !quote.quote || !quote.settled) return;
    const ids = quote.quote.selectedIds;
    req.mutate({ lawyerUserId: seller.userId, serviceId: isPkg ? undefined : service?.id, packageId: isPkg ? pkg?.id : undefined, ids, note: v.note, channel: v.channel, time: v.time }, {
      onSuccess: (r) => {
        onSent({ kind: "market", key: resultKey("market", r.workId, r.orderId), data: { ...r, serviceTitle: r.serviceTitle || title || "", lawyerName: r.lawyerName || seller.name, amount: r.amount || total } });
        close();
      },
      onError: (e) => (onBlock(e) ? close() : step.setErr(errText(e))),
    });
  };
  const rows: Fact[] = seller && target ? [
    { label: t("admSupC.confirm.client"), value: [client?.name || clientName, client?.lexgoId].filter(Boolean).join(" · ") },
    { label: t("admSupC.market.seller"), value: seller.name },
    { label: t(isPkg ? "ntd.ccV2.market.package" : "admSupC.market.service"), value: isPkg ? `${title} · ${pkg?.tariff}` : (title ?? "") },
    { label: t("ntd.po.title"), value: quote.quote?.lines.map((l) => l.label).join(", ") ?? "" },
    { label: t("ntd.po.total"), value: sum(total, quote.quote?.currency) },
    { label: t("admSupC.market.channel"), value: t(`admSupC.market.ch.${v.channel}`) },
    { label: t("admSupC.market.time"), value: v.time.trim() },
    { label: t("adm.note"), value: v.note.trim() },
  ] : [];
  return { ...p, items, service, opts, quote, target, form, v, set, err, step, rows, review, submit, close, pickSeller, pickService, pickKind, pickPkg, busy: req.isPending };
}
