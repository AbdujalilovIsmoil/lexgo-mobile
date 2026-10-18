import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Locale = "uz" | "ru" | "en";
export const LOCALES: Locale[] = ["uz", "ru", "en"];
export const LOCALE_LABELS: Record<Locale, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

// uz is the default, as on the web (/uz is the default route).
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "uz",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "lexgo_locale", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
