import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { serviceErrorOf, useServiceWrites, type ManagedService, type PriceBand, type ServiceError, type ServiceStatus } from "@/entities/organization";
import { serviceSchema } from "./serviceSchema";

export type Picked = { id: string; name: string; category: string; catalogPrice: number; advocateOnly: boolean };
type Ctx = { orgId: string; memberId: string; item: ManagedService | null };

let remembered = false; // the price-policy consent is asked once per app session
const remember = () => { remembered = true; };

const fromItem = (i: ManagedService | null): Picked | null => (i ? { id: i.id, name: i.name, category: i.category, catalogPrice: i.catalogPrice, advocateOnly: i.advocateOnly } : null);

// State, validation and the save call of the add / edit service form.
export function useServiceForm({ orgId, memberId, item }: Ctx, onDone: () => void) {
  const { save } = useServiceWrites(orgId, memberId);
  const [svc, setSvc] = useState<Picked | null>(null);
  const form = useAppForm(serviceSchema, { price: "", note: "", status: "active" });
  const [price, note, status] = form.watch(["price", "note", "status"]) as [string, string, ServiceStatus];
  const setPrice = (v: string) => form.setValue("price", v, { shouldValidate: true });
  const setStatus = (v: ServiceStatus) => form.setValue("status", v);
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<ServiceError | null>(null);
  const [serverBand, setServerBand] = useState<PriceBand | null>(null);
  const reset = () => {
    setSvc(fromItem(item));
    form.reset({ price: item?.selectedPrice ? String(item.selectedPrice) : "", note: item?.note ?? "", status: item?.status ?? "active" });
    setAgreed(remembered);
    setErr(null);
    setServerBand(null);
  };
  const submit = form.handleSubmit(async (v) => {
    if (!svc) return;
    setErr(null);
    try {
      await save.mutateAsync({ input: { serviceId: svc.id, price: Number(v.price || 0), note: v.note, status: v.status as ServiceStatus }, create: !item });
      remember();
      onDone();
    } catch (e) {
      const se = serviceErrorOf(e);
      setErr(se);
      if (se.band) setServerBand(se.band);
    }
  });
  const pick = (s: Picked | null) => {
    setSvc(s);
    setErr(null);
    setServerBand(null);
  };
  return { svc, pick, form, price, setPrice, note, status, setStatus, agreed, setAgreed, needConsent: !item && !remembered, err, serverBand, reset, submit, busy: save.isPending };
}
