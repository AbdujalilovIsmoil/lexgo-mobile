import { useState } from "react";
import { View } from "react-native";
import { clonePricing, DEFAULT_PRICING, PRICING, pricingBody, pricingIssues, readPricing, useSavePolicy, usePolicies } from "@/entities/admin-policies";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useDirtyClose } from "@/shared/lib/useDirtyClose";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { NumField } from "../json/NumField";
import { bad, Issues } from "./Issues";
import { PremiumGroups } from "./PremiumGroups";
import { RegionRows } from "./RegionRows";
import { TierRows } from "./TierRows";

// Marketplace pricing rules: the allowed price range, premiums and region coefficients, with the
// same validation as the web. Saving is confirmed (it re-prices the whole marketplace) and versioned.
export function PricingSheet({ visible, onClose, seed }: { visible: boolean; onClose: () => void; seed?: Dict | null }) {
  const { t } = useT();
  const raw = usePolicies().data?.[PRICING] ?? {};
  const start = () => clonePricing(readPricing(seed) ?? readPricing(raw) ?? DEFAULT_PRICING);
  const [p, setP] = useState(start);
  const save = useSavePolicy();
  useSheetReset(visible, () => setP(start()));
  const stored = readPricing(raw);
  const dirty = JSON.stringify(p) !== JSON.stringify(stored ?? DEFAULT_PRICING);
  const close = useDirtyClose(visible && JSON.stringify(p) !== JSON.stringify(start()), onClose);
  const issues = pricingIssues(p);
  const blocking = issues.filter((i) => !i.warn).length;
  const submit = () =>
    confirmDialog({
      title: t("admPol.saveConfirm"), message: t("admPol.saveConfirmText", { section: t("admPolC.pr.title") }), confirmLabel: t("adm.save"), cancelLabel: t("adm.cancel"), icon: "sliders",
      onConfirm: async () => { await save.mutateAsync({ section: PRICING, data: pricingBody(p, raw) }); onClose(); },
    });
  return (
    <FormSheet visible={visible} onClose={close} title={t("admPolC.pr.title")} subtitle={blocking ? t("admPolC.pr.issuesCount", { n: blocking }) : undefined} onSubmit={submit} submitting={save.isPending} disabled={blocking > 0 || (!dirty && !!stored)} secondary={{ label: t("admPolC.pr.defaults"), onPress: () => setP(clonePricing(DEFAULT_PRICING)) }} snaps={[0.85, 0.96]}>
      <Text variant="small" tone="gray">{t("admPolC.pr.lead")}</Text>
      <Text variant="h4">{t("admPolC.pr.range")}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><NumField label={t("admPolC.pr.min")} value={p.minPercent} error={bad(issues, "minPercent")} onChange={(v) => setP({ ...p, minPercent: v })} /></View>
        <View style={{ flex: 1 }}><NumField label={t("admPolC.pr.max")} value={p.maxPercent} error={bad(issues, "maxPercent")} onChange={(v) => setP({ ...p, maxPercent: v })} /></View>
      </View>
      <Issues items={issues.filter((i) => i.path === "minPercent" || i.path === "maxPercent")} />
      <TierRows p={p} issues={issues} onChange={setP} />
      <RegionRows p={p} issues={issues} onChange={setP} />
      <PremiumGroups p={p} issues={issues} onChange={setP} />
    </FormSheet>
  );
}
