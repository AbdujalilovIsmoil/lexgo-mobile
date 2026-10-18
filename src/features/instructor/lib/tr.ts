import { translate } from "@/shared/i18n";
import { useLocaleStore } from "@/shared/i18n/localeStore";

// Translation for non-React code (the command runner) in the current locale.
export const tr = (key: string, params?: Record<string, string | number>): string => translate(useLocaleStore.getState().locale, key, params);
