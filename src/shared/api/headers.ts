import { useLocaleStore } from "@/shared/i18n/localeStore";

// RFC 4122 v4 id for X-Request-ID (log correlation only, not a secret).
export function requestId(): string {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += "-";
    else if (i === 14) s += "4";
    else if (i === 19) s += hex[8 + Math.floor(Math.random() * 4)];
    else s += hex[Math.floor(Math.random() * 16)];
  }
  return s;
}

// Headers every API request carries (TZ 1.2): language + client-generated request id.
export function baseHeaders(): Record<string, string> {
  return { Accept: "application/json", "Accept-Language": useLocaleStore.getState().locale, "X-Request-ID": requestId() };
}
