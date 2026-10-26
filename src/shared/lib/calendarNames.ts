// Month and weekday names of the three app languages. Hermes on Android has no Uzbek calendar data (toLocaleDateString("uz-UZ") printed
// "Oct 26, 2026"), so dates are put together from these instead of Intl — the same on every phone, and cheaper than Intl on Hermes.
type Names = { short: string[]; long: string[]; days: string[] };
const NAMES: Record<"uz" | "ru" | "en", Names> = {
  uz: {
    short: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
    long: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
    days: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  },
  ru: {
    short: ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."],
    long: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  },
  en: {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
};

const of = (locale: string): Names => NAMES[locale === "ru" || locale === "en" ? locale : "uz"];

/** Short month name, 0-based month. */
export const monthShort = (m: number, locale: string): string => of(locale).short[m] ?? "";
/** Full month name (lower case in uz / ru, as written inside a sentence), 0-based month. */
export const monthLong = (m: number, locale: string): string => of(locale).long[m] ?? "";
/** Short weekday of an ISO day (1 = Monday … 7 = Sunday). */
export const weekdayShort = (isoDay: number, locale: string): string => of(locale).days[(isoDay + 6) % 7] ?? "";
