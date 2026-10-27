import { useState } from "react";
import { priceIssue, serviceErrorOf, useQuoteBand, useSaveService, type PriceBand, type ProService, type ServiceError, type ServiceStatus } from "@/entities/pro-service";
import { selectedToSend, useServiceConfiguration } from "@/entities/pro-service/config";
import { useServiceRules, type RulesTarget } from "@/entities/service-rules";
import { useAppForm } from "@/shared/form";
import { successHaptic } from "@/shared/lib/haptics";
import { afterSheet } from "@/shared/lib/sel";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { serviceSchema } from "./serviceSchema";
import type { FormValues, PickedService } from "./types";

type Args = { visible: boolean; item: ProService | null; sellerId: string; region: string; onDone: () => void; onRules?: (t: RulesTarget) => void };

const fromItem = (i: ProService): PickedService => ({ id: i.id, name: i.name, category: [i.categoryTitle, i.subcategory].filter(Boolean).join(" · "), catalogPrice: i.catalogPrice, advokatRequired: i.advokatRequired, slug: "" });
const blank: FormValues = { price: "", note: "", status: "active" };

// The server's own limits win; the quote only completes what they lack (base price, factors).
const merge = (a: PriceBand | null, b: PriceBand | null): PriceBand | null => (a && b ? { ...a, base: a.base ?? b.base, modifiers: a.modifiers ?? b.modifiers } : (a ?? b));

// State of the add / edit service form: choice, price against the live corridor, server errors (TZ 19). "Active" is held back
// while the picked service has rules to accept (TZ.md §5.3): saving then opens them instead. An edit sends the service's current
// negotiation and rule picks back (from its configuration), so saving the form does not reset them.
export function useServiceForm({ visible, item, sellerId, region, onDone, onRules }: Args) {
  const { t } = useT();
  const [picked, setPicked] = useState<PickedService | null>(null);
  const form = useAppForm(serviceSchema, blank);
  const values = form.watch() as FormValues;
  const [err, setErr] = useState<ServiceError | null>(null);
  const [agreed, setAgreed] = useState(false); // price-policy consent, asked on every save
  const [tried, setTried] = useState(false);
  const save = useSaveService();
  useSheetReset(visible, () => {
    setPicked(item ? fromItem(item) : null);
    form.reset(item ? { price: item.selectedPrice ? String(item.selectedPrice) : "", note: item.note, status: item.status } : blank);
    setErr(null);
    setAgreed(false);
    setTried(false);
  });
  // The gate: an edited service's configuration when it says rules are missing, else the picked service's rule list.
  const cfg = useServiceConfiguration(visible && item ? item.id : "");
  const c = cfg.data ?? null;
  const rules = useServiceRules(picked?.id ?? "", visible && !!picked);
  const listed = picked ? (rules.data?.items ?? []).filter((r) => !r.accepted && r.id).map((r) => r.id) : [];
  const missing = c?.rulesPending && c.missingRuleIds.length ? c.missingRuleIds : listed;
  const locked = values.status === "active" && (missing.length > 0 || !!c?.rulesPending);
  const openRules = (focus: string[]) => picked && onRules?.({ serviceId: picked.id, focus, extra: c?.requiredRules });
  const complete = !!item?.limits?.modifiers;
  const quote = useQuoteBand(picked && !complete ? picked.id : "", sellerId, region);
  const band = err?.kind === "range" ? err.limits : merge(item?.limits ?? null, quote.data ?? null);
  const n = Number(values.price || "0");
  const issue = priceIssue(n, band);
  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    form.setValue(k as "price", v as string, { shouldValidate: true });
    if (err?.kind === "range") setErr(null);
  };
  const submit = form.handleSubmit(async (v) => {
    if (!picked || issue) return;
    if (!agreed) return setTried(true);
    if (locked) return void openRules(missing);
    try {
      const input = { serviceId: picked.id, selectedPrice: Number(v.price || "0"), note: v.note, status: v.status as ServiceStatus, negotiationAllowed: c?.negotiationAllowed ?? item?.negotiationAllowed ?? null, selectedRuleIds: c ? (selectedToSend(c) ?? null) : null };
      const r = await save.mutateAsync({ input, create: !item, wasActive: item?.status === "active" });
      onDone();
      if (r.blocked) {
        // Saved, but the rules kept it off: say so, and open them once this sheet is gone.
        toast(t("svcRules.rulesSavedNotEnabled"), "err");
        const { missing: focus, rules: listed } = r.blocked;
        afterSheet(() => onRules?.({ serviceId: input.serviceId, focus, extra: listed.length ? listed : c?.requiredRules }));
        return;
      }
      successHaptic();
      toast(t(item ? "proSvc.toast.saved" : "proSvc.toast.added"), "ok");
      if (r.warn) toast(t("svcRules.cfgConfigFailed"), "err");
    } catch (e) {
      const se = serviceErrorOf(e);
      setErr(se);
      if (se.kind === "rules") openRules(se.missing);
    }
  });
  const valid = !!picked && !issue && agreed && !(item && cfg.isLoading);
  return { picked, valid, setPicked, form, values, set, err, agreed, setAgreed, policyMissing: tried && !agreed, band, bandLoading: quote.isFetching && !band, n, issue, submit, saving: save.isPending, change: () => setPicked(null), locked, openRules: () => openRules(missing) };
}
