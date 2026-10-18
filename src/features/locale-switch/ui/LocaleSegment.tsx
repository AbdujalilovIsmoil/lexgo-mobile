import { Segmented } from "@/shared/ui";
import { LOCALES, LOCALE_LABELS, useLocaleStore } from "@/shared/i18n";

// uz / ru / en, same three locales as the web's LanguageSwitcher.
export function LocaleSegment() {
  const { locale, setLocale } = useLocaleStore();
  return <Segmented value={locale} onChange={setLocale} options={LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] }))} />;
}
