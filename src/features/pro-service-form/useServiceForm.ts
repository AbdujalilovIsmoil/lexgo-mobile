import { useState } from "react";
import { priceIssue, serviceErrorOf, useQuoteBand, useSaveService, type PriceBand, type ProService, type ServiceError, type ServiceStatus } from "@/entities/pro-service";
import { useAppForm } from "@/shared/form";
import { successHaptic } from "@/shared/lib/haptics";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { serviceSchema } from "./serviceSchema";
import type { FormValues, PickedService } from "./types";

type Args = { visible: boolean; item: ProService | null; sellerId: string; region: string; onDone: () => void };

const fromItem = (i: ProService): PickedService => ({ id: i.id, name: i.name, category: [i.categoryTitle, i.subcategory].filter(Boolean).join(" · "), catalogPrice: i.catalogPrice, advokatRequired: i.advokatRequired, slug: "" });
const blank: FormValues = { price: "", note: "", status: "active" };

// The server's own limits win; the quote only completes what they lack (base price, factors).
const merge = (a: PriceBand | null, b: PriceBand | null): PriceBand | null => (a && b ? { ...a, base: a.base ?? b.base, modifiers: a.modifiers ?? b.modifiers } : (a ?? b));

// State of the add / edit service form: choice, price against the live corridor, server errors (TZ 19).
export function useServiceForm({ visible, item, sellerId, region, onDone }: Args) {
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
    try {
      await save.mutateAsync({ input: { serviceId: picked.id, selectedPrice: Number(v.price || "0"), note: v.note, status: v.status as ServiceStatus }, create: !item });
      successHaptic();
      toast(t(item ? "proSvc.toast.saved" : "proSvc.toast.added"), "ok");
      onDone();
    } catch (e) {
      setErr(serviceErrorOf(e));
    }
  });
  const valid = !!picked && !issue && agreed;
  return { picked, valid, setPicked, form, values, set, err, agreed, setAgreed, policyMissing: tried && !agreed, band, bandLoading: quote.isFetching && !band, n, issue, submit, saving: save.isPending, change: () => setPicked(null) };
}
