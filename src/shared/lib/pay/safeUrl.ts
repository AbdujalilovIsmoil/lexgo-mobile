// Only https pages are ever opened for a payment, gift or share (TZ 40: URL scheme allowlist).
export const safeHttpsUrl = (v: unknown): string => (typeof v === "string" && /^https:\/\/\S+$/i.test(v.trim()) ? v.trim() : "");
