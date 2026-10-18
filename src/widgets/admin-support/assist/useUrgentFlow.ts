import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { DIRECTIONS, URGENT_GROUP, resultKey, urgentChannels, urgentFallback, urgentFieldErrors, urgentMinutes, urgentPrice, isRouteMissing, useRequestUrgent, useUrgentCatalog } from "@/entities/admin-support";
import type { Fact } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { urgentSchema } from "./assistSchemas";
import { useAssistStep } from "./AssistFormSheet";
import type { FlowProps } from "./flowTypes";
import { useAssistError } from "./useAssistError";
import { useSum } from "./useSum";

const FALLBACK = urgentFallback();
const EMPTY = { kind: "", channel: "video", count: 3, dirs: [] as string[], need: "" };

// Urgent-lawyer request for the client: service → channel (→ lawyers) → directions → the client's problem.
export function useUrgentFlow({ ticketId, client, clientName, visible, onClose, onSent, onBlock }: FlowProps) {
  const { t } = useT();
  const sum = useSum();
  const errText = useAssistError();
  const catalog = useUrgentCatalog(visible).data ?? FALLBACK;
  const form = useAppForm(urgentSchema, EMPTY);
  const v = form.watch();
  const [bad, setBad] = useState<Record<string, string>>({});
  const step = useAssistStep();
  const req = useRequestUrgent(ticketId);
  const svc = catalog.services.find((s) => s.key === v.kind);
  const channels = urgentChannels(svc);
  const channel = channels.includes(v.channel) ? v.channel : (channels[0] ?? "video");
  const group = v.kind === URGENT_GROUP;
  const min = svc?.lawyerMin || 2;
  const max = svc?.lawyerMax || 7;
  const lawyers = Math.min(max, Math.max(min, v.count));
  const price = svc && catalog.priced ? urgentPrice(svc, channel, group ? lawyers : 1) : 0;
  const set = (patch: Partial<typeof EMPTY>) => { for (const k of Object.keys(patch) as (keyof typeof EMPTY)[]) form.setValue(k, patch[k] as never); setBad({}); };
  const close = () => { step.reset(); form.reset(EMPTY); setBad({}); onClose(); };

  const review = () => {
    const next: Record<string, string> = {};
    if (!svc) next.kind = t("admSupC.urgent.pickKind");
    if (!v.dirs.length) next.directions = t("admSupC.urgent.missDirection");
    setBad(next);
    void form.handleSubmit(() => { if (!Object.keys(next).length) step.review(); })();
  };
  const submit = () => {
    if (!svc) return;
    req.mutate({ kind: v.kind, channel, need: v.need, directions: v.dirs, lawyerCount: group ? lawyers : undefined }, {
      onSuccess: (r) => { onSent({ kind: "urgent", key: resultKey("urgent", r.workId, r.id), data: { ...r, serviceKind: r.serviceKind || v.kind, channel: r.channel || channel, amount: r.amount || price } }); close(); },
      onError: (e) => {
        const fields = urgentFieldErrors(e);
        if (onBlock(e)) return close();
        if (isRouteMissing(e) || Object.keys(fields).length) { setBad(isRouteMissing(e) ? { kind: t("adm.unavailable") } : fields); if (fields.need) form.setError("need", { message: fields.need }); return step.back(); }
        step.setErr(errText(e));
      },
    });
  };
  const rows: Fact[] = svc ? [
    { label: t("admSupC.confirm.client"), value: [client?.name || clientName, client?.lexgoId].filter(Boolean).join(" · ") },
    { label: t("admSupC.urgent.kind"), value: t(`admSupC.urgent.kinds.${svc.key}`) },
    { label: t("admSupC.urgent.channel"), value: t(`admSupC.urgent.ch.${channel}`) },
    { label: t("admSupC.urgent.count"), value: group ? String(lawyers) : "" },
    { label: t("admSupC.urgent.directions"), value: DIRECTIONS.filter((d) => v.dirs.includes(d.slug)).map((d) => t(`admSupC.urgent.areas.${d.area}`)).join(", ") },
    { label: t("admSupC.urgent.need"), value: v.need.trim() },
    { label: t("adm.price"), value: price > 0 ? sum(price) : "" },
  ] : [];
  return { catalog, form, v, set, bad, svc, channels, channel, group, min, max, lawyers, price, minutes: svc ? urgentMinutes(svc, channel) : 0, step, rows, review, submit, close, busy: req.isPending, sum, clientName: client?.name || clientName || t("admSupB.client.noName") };
}
