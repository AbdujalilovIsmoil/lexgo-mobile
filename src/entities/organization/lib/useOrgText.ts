import { humanizeSlug } from "@/shared/lib/format";
import { translate, useLocaleStore } from "@/shared/i18n";

// Backend codes as translated text: og9.st.* (statuses), og9.kind.* (seller types), lawyers.regions.*; unknown codes are tidied.
export function useOrgText() {
  const locale = useLocaleStore((s) => s.locale);
  const pick = (ns: string) => (code: string) => {
    if (!code) return "";
    const key = `${ns}.${code.toLowerCase()}`;
    const text = translate(locale, key);
    return text === key ? humanizeSlug(code) : text;
  };
  return { status: pick("og9.st"), kind: pick("og9.kind"), region: pick("lawyers.regions") };
}
