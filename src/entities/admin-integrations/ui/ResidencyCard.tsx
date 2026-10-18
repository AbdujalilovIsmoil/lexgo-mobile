import { View } from "react-native";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Pill, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { Residency } from "../model/types";

const TONE = { confirmed: "ok", pending: "warn", unknown: "gray" } as const;

// Uzbekistan data residency: state pill, an honest note, and region / provider / last check when known.
export function ResidencyCard({ residency }: { residency: Residency | null }) {
  const { t, locale } = useT();
  const state = residency?.state ?? "unknown";
  return (
    <SectionCard title={t("admInt.resTitle")}>
      <View style={{ alignSelf: "flex-start" }}><Pill tone={TONE[state]} label={t(`admInt.res.${state}`)} /></View>
      <Text variant="small" tone="gray">{t(`admInt.resNote.${state}`)}</Text>
      <FactRows rows={[
        { label: t("admInt.region"), value: residency?.region },
        { label: t("admInt.provider"), value: residency?.provider },
        { label: t("admInt.checkedAt"), value: residency?.checkedAt ? fmtDateTime(residency.checkedAt, locale) || residency.checkedAt : "" },
      ]} />
    </SectionCard>
  );
}
