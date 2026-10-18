import { useState } from "react";
import { allowedGiftMonths, estimateGift, usePlans } from "@/entities/plan";
import type { GiftCreated } from "@/entities/profile-extras";
import { fmtUzs } from "@/entities/payment";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { Segmented, Text } from "@/shared/ui";
import { normPhone } from "@/shared/lib/phone";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { giftSchema } from "./giftSchema";
import { ServicePick } from "./ServicePick";
import { useCreateGift } from "./useCreateGift";

type Kind = "plan" | "service";

// Gift a tariff (for 3/6/12 months, as the plan allows) or a single service; the recipient gets a
// link and a QR code. The price shown is an estimate — the final amount is the backend's.
export function GiftSheet({ visible, onClose, onCreated }: { visible: boolean; onClose: () => void; onCreated: (g: GiftCreated) => void }) {
  const { t } = useT();
  const plans = (usePlans().data ?? []).filter((p) => p.isGiftable);
  const [kind, setKind] = useState<Kind>("plan");
  const [slug, setSlug] = useState("");
  const [months, setMonths] = useState(6);
  const [svc, setSvc] = useState<{ id: string; name: string } | null>(null);
  const f = useAppForm(giftSchema, { hint: "", phone: "+998 ", message: "" });
  useSheetReset(visible, () => { setKind("plan"); setSlug(""); setMonths(6); setSvc(null); f.reset({ hint: "", phone: "+998 ", message: "" }); });
  const create = useCreateGift((g) => { onClose(); setTimeout(() => onCreated(g), 350); });
  const plan = plans.find((p) => p.slug === slug) ?? plans[0];
  const terms = plan ? allowedGiftMonths(plan) : [];
  const term = terms.includes(months) ? months : terms[0] ?? 6;
  const ok = kind === "plan" ? !!plan : !!svc;
  const submit = f.handleSubmit((v) => create.mutate({ planSlug: kind === "plan" ? plan?.slug : undefined, serviceId: kind === "service" ? svc?.id : undefined, months: term, hint: v.hint, phone: normPhone(v.phone), message: v.message }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("py8.give")} subtitle={t("py8.giveLead")} submitLabel={t("py8.send")} disabled={!ok} submitting={create.isPending} onSubmit={() => void submit()}>
      <Segmented value={kind} onChange={setKind} options={[{ value: "plan", label: t("py8.kindPlan") }, { value: "service", label: t("py8.kindService") }]} />
      {kind === "plan" ? (
        plans.length ? (
          <>
            {plans.length > 1 ? <SelectField label={t("py8.plan")} value={plan?.slug ?? ""} onChange={setSlug} options={plans.map((p) => ({ value: p.slug, label: p.name }))} /> : <Text variant="body" weight="semibold">{plan?.name}</Text>}
            <SelectField label={t("py8.term")} value={String(term)} onChange={(v) => setMonths(Number(v))} options={terms.map((n) => ({ value: String(n), label: t("py8.months", { n }) }))} />
            {plan ? <Text variant="small" tone="gray">{t("py8.estimate", { sum: fmtUzs(estimateGift(plan, term), t) })}</Text> : null}
          </>
        ) : <Text variant="small" tone="gray">{t("py8.noPlans")}</Text>
      ) : <ServicePick value={svc} onPick={setSvc} />}
      <FormInput control={f.control} name="hint" label={t("py8.recipient")} placeholder={t("py8.recipientPh")} />
      <FormPhoneInput control={f.control} name="phone" label={t("py8.phone")} />
      <FormInput control={f.control} name="message" label={t("py8.message")} placeholder={t("py8.messagePh")} multiline maxLength={300} />
    </FormSheet>
  );
}
