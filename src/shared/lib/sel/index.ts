import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// "1 250 000 so'm" in the active language.
export function useSom() {
  const { t } = useT();
  return (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
}

// A sheet that opens right after another one closed must wait for the close animation.
export const afterSheet = (fn: () => void) => setTimeout(fn, 320);
