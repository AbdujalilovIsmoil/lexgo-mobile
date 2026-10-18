// Only http(s) links from AI answers are ever opened (TZ 40: URL scheme allowlist).
export const safeUrl = (u?: string): string | undefined => (u && /^https?:\/\//i.test(u) ? u : undefined);
