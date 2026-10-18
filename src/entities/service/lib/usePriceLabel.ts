import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Service } from "../model/types";

// "Bepul" for free templates, "149 000 so'm" for priced ones, otherwise "by arrangement".
export function usePriceLabel(): (s: Pick<Service, "price" | "free">) => string {
  const { t } = useT();
  return (s) => (s.price ? `${fmtMoney(s.price)} ${t("common.currency")}` : s.free ? t("dc1.free") : t("services.priceOnRequest"));
}
