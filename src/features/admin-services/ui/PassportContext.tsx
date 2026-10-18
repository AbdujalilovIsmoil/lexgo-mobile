import { FactRows } from "@/shared/ui/admin";
import type { Passport } from "@/entities/admin-services";
import { useT } from "@/shared/i18n";

const days = (v: string, t: (k: string, p?: Record<string, string | number>) => string) => (!v || v === "0" ? "" : /[^\d\s.,–-]/.test(v) ? v : t("admSvcB.days", { value: v }));

// Read-only catalogue context from the passport: code, family, subcategory, durations, version.
export function PassportContext({ p }: { p: Passport }) {
  const { t } = useT();
  return (
    <FactRows rows={[
      { label: t("admSvcB.code"), value: p.catalogCode },
      { label: t("admSvcB.family"), value: p.group && p.group !== p.family ? `${p.family} · ${p.group}` : p.family },
      { label: t("admSvcB.subcategory"), value: p.subcategory && p.subcategory !== p.family ? p.subcategory : "" },
      { label: t("admSvcB.duration"), value: days(p.standardDuration, t) },
      { label: t("admSvcB.urgent"), value: days(p.urgentDuration, t) },
      { label: t("admSvcB.version"), value: p.version },
    ]} />
  );
}
