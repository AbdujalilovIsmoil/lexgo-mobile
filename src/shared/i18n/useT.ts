import { useCallback } from "react";
import { uz, type Messages } from "./locales/uz";
import { useLocaleStore, type Locale } from "./localeStore";
import { applyPlural } from "./plural";

// uz is the default and every key's fallback, so it is always loaded. ru / en (about 240 modules each) are evaluated only once chosen:
// a start in Uzbek — and every headless background run — skips two thirds of the texts.
const dictionaries: Partial<Record<Locale, Messages>> = { uz };
function dictionary(locale: Locale): Messages {
  let d = dictionaries[locale];
  if (!d) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    d = locale === "ru" ? (require("./locales/ru") as { ru: Messages }).ru : (require("./locales/en") as { en: Messages }).en;
    /* eslint-enable @typescript-eslint/no-require-imports */
    dictionaries[locale] = d;
  }
  return d;
}

type Params = Record<string, string | number>;

function lookup(dict: Messages, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => (cur && typeof cur === "object" ? (cur as Record<string, unknown>)[key] : undefined), dict);
}

function interpolate(s: string, params: Params | undefined, locale: Locale): string {
  if (!params) return s;
  return applyPlural(s, params, locale).replace(/\{(\w+)\}/g, (_, k: string) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function translate(locale: Locale, key: string, params?: Params): string {
  const v = lookup(dictionary(locale), key) ?? lookup(uz, key);
  return typeof v === "string" ? interpolate(v, params, locale) : key;
}

// t("home.heroLead") → string; tList("ai.quick") → string[]; tObj for nested maps.
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback((key: string, params?: Params) => translate(locale, key, params), [locale]);
  const tList = useCallback(
    <T = string>(key: string): T[] => {
      const v = lookup(dictionary(locale), key) ?? lookup(uz, key);
      return Array.isArray(v) ? (v as T[]) : [];
    },
    [locale],
  );
  return { t, tList, locale };
}
