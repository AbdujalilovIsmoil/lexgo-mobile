// Card-number helpers for the step that comes before a paid request. Pure and local: the number is only checked on the phone
// (length, Luhn, expiry) and is never stored, logged or sent anywhere — the provider's page takes the real payment.

export const digitsOf = (s: string): string => s.replace(/\D/g, "");

/** Pasted "4242-4242 4242 4242" or typed digits → at most 19 digits, grouped by 4. */
export const formatCard = (s: string): string => (digitsOf(s).slice(0, 19).match(/.{1,4}/g) ?? []).join(" ");

/** 13–19 digits and a valid Luhn checksum. */
export function cardOk(s: string): boolean {
  const d = digitsOf(s);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

/** "1228" → "12/28"; a first digit above 1 gets a leading zero ("3" → "03"). */
export function formatExpiry(s: string): string {
  let d = digitsOf(s).slice(0, 4);
  if (d.length === 1 && Number(d) > 1) d = `0${d}`;
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** MM/YY, month 01–12, not before the current month. */
export function expiryOk(s: string, now: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(s);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(m[2]);
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}
