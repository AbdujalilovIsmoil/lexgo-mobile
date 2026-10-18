// What may never reach local storage (TZ 38): OTP/TOTP secrets, tokens, full payment requisites.
const SECRET_KEY = /(^|[_\-.])(otp|totp|secret|token|password|passwd|pin|cvv|cvc|card|pan|iban|requisites?|authorization|api_?key)([_\-.]|$)/i;
const MAX_BYTES = 400_000;

export function scrub(value: unknown, depth = 0): unknown {
  if (depth > 10 || value === null || typeof value !== "object") return typeof value === "function" ? undefined : value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) if (!SECRET_KEY.test(k)) out[k] = scrub(v, depth + 1);
  return out;
}

export const isSecretKey = (key: string): boolean => SECRET_KEY.test(key);

// JSON text of a scrubbed value, or null when it is too large to be worth keeping.
export function serialize(value: unknown): string | null {
  try {
    const text = JSON.stringify(scrub(value));
    return text && text.length <= MAX_BYTES ? text : null;
  } catch {
    return null;
  }
}
