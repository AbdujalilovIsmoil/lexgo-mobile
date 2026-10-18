import type { MktFilters } from "@/features/admin-marketplace";
import { useT } from "@/shared/i18n";

// "30 days · Completed · Seller name" — what the numbers on screen are limited to.
export function useScopeText(f: MktFilters): string {
  const { t } = useT();
  const { from, to } = f.bar.range;
  const period = from || to ? `${from || "…"} – ${to || "…"}` : t("admMkt.scopeAll");
  return [period, f.status ? t(`admMkt.filter.statusOpt.${f.status}`) : "", f.seller?.label ?? "", f.client?.label ?? ""].filter(Boolean).join(" · ");
}
