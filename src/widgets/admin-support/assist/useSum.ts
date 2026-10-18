import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// "149 000 so'm" for UZS, "100 USD" otherwise.
export function useSum() {
  const { t } = useT();
  return (n: number, currency = "UZS") => (!currency || currency === "UZS" ? `${fmtMoney(n)} ${t("adm.currency")}` : `${fmtMoney(n)} ${currency}`);
}
