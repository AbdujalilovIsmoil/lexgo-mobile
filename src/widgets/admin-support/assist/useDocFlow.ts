import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { resultKey, useDocServices, useRequestDocument, type DocService } from "@/entities/admin-support";
import type { Fact } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { docSchema, NEED_MAX } from "./assistSchemas";
import { useAssistStep } from "./AssistFormSheet";
import type { FlowProps } from "./flowTypes";
import { useAssistError } from "./useAssistError";
import { useSum } from "./useSum";

export type DocBase = { service: DocService | null }; // service null = "from scratch"
export { NEED_MAX };
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const EMPTY = { q: "", title: "", need: "", language: "uz", docType: "" };

// Document request for the lawyers' pool: based on a service/template or written from scratch.
export function useDocFlow({ ticketId, client, clientName, visible, onClose, onSent, onBlock }: FlowProps) {
  const { t } = useT();
  const sum = useSum();
  const errText = useAssistError();
  const [base, setBase] = useState<DocBase | null>(null);
  const form = useAppForm(docSchema, EMPTY);
  const v = form.watch();
  const [err, setErr] = useState("");
  const step = useAssistStep();
  const req = useRequestDocument(ticketId);
  const found = useDocServices(useDebounced(v.q.trim(), 350));
  const service = base?.service ?? null;
  const set = (patch: Partial<typeof EMPTY>) => { for (const k of Object.keys(patch) as (keyof typeof EMPTY)[]) form.setValue(k, patch[k] as never); setErr(""); };
  const close = () => { step.reset(); setBase(null); form.reset(EMPTY); setErr(""); onClose(); };

  const review = () => {
    if (!base) return setErr(t("admSupC.doc.baseRequired"));
    void form.handleSubmit(() => step.review())();
  };
  const pick = (next: DocBase) => { setBase(next); if (!v.title.trim()) set({ title: next.service?.name.slice(0, 200) ?? "" }); };
  const submit = () => {
    if (!base) return;
    req.mutate(
      { serviceId: service?.id, templateId: service?.templateId || undefined, title: v.title.trim() || service?.name || "", need: v.need, language: v.language, docType: v.docType },
      {
        onSuccess: (data) => { onSent({ kind: "doc", key: resultKey("doc", data.workId, data.requestId), data }); close(); },
        onError: (e) => (onBlock(e) ? close() : step.setErr(errText(e))),
      },
    );
  };
  const rows: Fact[] = [
    { label: t("admSupC.confirm.client"), value: [client?.name || clientName, client?.lexgoId].filter(Boolean).join(" · ") },
    { label: t("admSupC.doc.base"), value: service ? service.name : t("admSupC.doc.scratch") },
    { label: t("adm.title"), value: v.title.trim() },
    { label: t("admSupC.doc.need"), value: clip(v.need.trim(), 280) },
    { label: t("admSupC.doc.language"), value: t(`admSupC.lang.${v.language}`) },
    { label: t("admSupC.doc.type"), value: v.docType.trim() },
    { label: t("admSupC.doc.price"), value: service?.price ? sum(service.price) : "" },
  ];
  const note = service?.price ? t("admSupC.doc.confirmPaid", { amount: sum(service.price) }) : t("admSupC.doc.confirmNote");
  return { visible, base, service, form, v, set, pick, clearBase: () => setBase(null), found, err, step, rows, note, review, submit, close, busy: req.isPending };
}
