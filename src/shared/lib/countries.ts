// Countries offered next to a phone field: the dial code, a flag, the way a national number is grouped and how long it may be.
// "+7" is shared by Russia and Kazakhstan (the first one wins when a number is read back). Uzbekistan is the default.
export type Country = { code: string; dial: string; flag: string; groups: number[]; name: { uz: string; ru: string; en: string } };

export const COUNTRIES: Country[] = [
  { code: "UZ", dial: "998", flag: "🇺🇿", groups: [2, 3, 2, 2], name: { uz: "O'zbekiston", ru: "Узбекистан", en: "Uzbekistan" } },
  { code: "RU", dial: "7", flag: "🇷🇺", groups: [3, 3, 2, 2], name: { uz: "Rossiya", ru: "Россия", en: "Russia" } },
  { code: "KZ", dial: "7", flag: "🇰🇿", groups: [3, 3, 2, 2], name: { uz: "Qozog'iston", ru: "Казахстан", en: "Kazakhstan" } },
  { code: "KG", dial: "996", flag: "🇰🇬", groups: [3, 3, 3], name: { uz: "Qirg'iziston", ru: "Киргизия", en: "Kyrgyzstan" } },
  { code: "TJ", dial: "992", flag: "🇹🇯", groups: [2, 3, 4], name: { uz: "Tojikiston", ru: "Таджикистан", en: "Tajikistan" } },
  { code: "TM", dial: "993", flag: "🇹🇲", groups: [2, 6], name: { uz: "Turkmaniston", ru: "Туркменистан", en: "Turkmenistan" } },
  { code: "AF", dial: "93", flag: "🇦🇫", groups: [2, 3, 4], name: { uz: "Afg'oniston", ru: "Афганистан", en: "Afghanistan" } },
  { code: "AZ", dial: "994", flag: "🇦🇿", groups: [2, 3, 2, 2], name: { uz: "Ozarbayjon", ru: "Азербайджан", en: "Azerbaijan" } },
  { code: "TR", dial: "90", flag: "🇹🇷", groups: [3, 3, 2, 2], name: { uz: "Turkiya", ru: "Турция", en: "Türkiye" } },
  { code: "UA", dial: "380", flag: "🇺🇦", groups: [2, 3, 2, 2], name: { uz: "Ukraina", ru: "Украина", en: "Ukraine" } },
  { code: "BY", dial: "375", flag: "🇧🇾", groups: [2, 3, 2, 2], name: { uz: "Belarus", ru: "Беларусь", en: "Belarus" } },
  { code: "DE", dial: "49", flag: "🇩🇪", groups: [3, 4, 4], name: { uz: "Germaniya", ru: "Германия", en: "Germany" } },
  { code: "GB", dial: "44", flag: "🇬🇧", groups: [4, 6], name: { uz: "Buyuk Britaniya", ru: "Великобритания", en: "United Kingdom" } },
  { code: "US", dial: "1", flag: "🇺🇸", groups: [3, 3, 4], name: { uz: "AQSH", ru: "США", en: "United States" } },
  { code: "KR", dial: "82", flag: "🇰🇷", groups: [2, 4, 4], name: { uz: "Janubiy Koreya", ru: "Южная Корея", en: "South Korea" } },
  { code: "CN", dial: "86", flag: "🇨🇳", groups: [3, 4, 4], name: { uz: "Xitoy", ru: "Китай", en: "China" } },
  { code: "AE", dial: "971", flag: "🇦🇪", groups: [2, 3, 4], name: { uz: "BAA", ru: "ОАЭ", en: "UAE" } },
  { code: "SA", dial: "966", flag: "🇸🇦", groups: [2, 3, 4], name: { uz: "Saudiya Arabistoni", ru: "Саудовская Аравия", en: "Saudi Arabia" } },
  { code: "IN", dial: "91", flag: "🇮🇳", groups: [5, 5], name: { uz: "Hindiston", ru: "Индия", en: "India" } },
  { code: "JP", dial: "81", flag: "🇯🇵", groups: [2, 4, 4], name: { uz: "Yaponiya", ru: "Япония", en: "Japan" } },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];
