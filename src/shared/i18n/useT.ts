import { useCallback } from "react";
import { uz, type Messages } from "./locales/uz";
import { ru } from "./locales/ru";
import { en } from "./locales/en";
import { useLocaleStore, type Locale } from "./localeStore";
import { applyPlural } from "./plural";

const dictionaries: Record<Locale, Messages> = { uz, ru, en };

type Params = Record<string, string | number>;

function lookup(dict: Messages, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => (cur && typeof cur === "object" ? (cur as Record<string, unknown>)[key] : undefined), dict);
}

function interpolate(s: string, params: Params | undefined, locale: Locale): string {
  if (!params) return s;
  return applyPlural(s, params, locale).replace(/\{(\w+)\}/g, (_, k: string) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function translate(locale: Locale, key: string, params?: Params): string {
  const v = lookup(dictionaries[locale], key) ?? lookup(uz, key);
  return typeof v === "string" ? interpolate(v, params, locale) : key;
}

// t("home.heroLead") → string; tList("ai.quick") → string[]; tObj for nested maps.
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback((key: string, params?: Params) => translate(locale, key, params), [locale]);
  const tList = useCallback(
    <T = string>(key: string): T[] => {
      const v = lookup(dictionaries[locale], key) ?? lookup(uz, key);
      return Array.isArray(v) ? (v as T[]) : [];
    },
    [locale],
  );
  return { t, tList, locale };
}
