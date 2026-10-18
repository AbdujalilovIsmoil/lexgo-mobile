import { useState } from "react";
import type { Dict } from "@/shared/lib/json";
import { PRICING, readPricing, usePolicies } from "@/entities/admin-policies";
import { PricingSheet } from "@/features/admin-policies";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Button, Pill, Skeleton, Text } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";

// Marketplace pricing at a glance (allowed range, tiers, regions); edit opens the full rules editor.
export function PricingCard({ onHistory, seed, onSeedUsed }: { onHistory: () => void; seed?: Dict | null; onSeedUsed?: () => void }) {
  const { t } = useT();
  const q = usePolicies();
  const [open, setOpen] = useState(false);
  const raw = q.data?.[PRICING];
  const p = readPricing(raw);
  return (
    <SectionCard title={t("admPolC.pr.title")} action={q.data ? { label: t("adm.edit"), onPress: () => setOpen(true) } : undefined}>
      <Text variant="small" tone="gray">{t("admPolC.pr.lead")}</Text>
      {q.isLoading ? <Skeleton height={80} round={16} /> : q.isError ? <Text variant="small" tone="err">{t("common.serverError")}</Text> : (
        <>
          <View style={{ alignSelf: "flex-start" }}><Pill small tone={p ? "ok" : "gray"} label={p ? t("admPolC.pr.live") : t("admPolC.pr.notSaved")} /></View>
          {p ? <FactRows rows={[{ label: t("admPolC.pr.range"), value: `${p.minPercent}–${p.maxPercent}%` }, { label: t("admPolC.pr.exp.title"), value: t("admPol.listValue", { n: p.experience.length }) }, { label: t("admPolC.pr.region.title"), value: t("admPol.listValue", { n: p.regions.length }) }]} /> : null}
          <Button title={t("admPol.history")} icon="clock" variant="ghost" size="sm" onPress={onHistory} />
        </>
      )}
      <PricingSheet visible={open || !!seed} seed={seed} onClose={() => { setOpen(false); onSeedUsed?.(); }} />
    </SectionCard>
  );
}
