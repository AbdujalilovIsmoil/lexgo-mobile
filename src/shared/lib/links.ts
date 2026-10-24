import { Linking } from "react-native";

// Phone dialer and http(s) links; failures are silent (no handler installed).
export const openTel = (phone: string) => void Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`).catch(() => {});
/**
 * What a link may open: web pages, mail, phone / SMS and the app's own screens. A link in a server text or an AI answer is completed the way
 * a reader means it — "lexgo.uz/…" or "www.…" is a web page, "/services/…" is one of the app's screens (opened through the app's link
 * checks) — and anything else (javascript:, file:, intent:, another app's scheme) is not opened. null = not openable.
 */
export function linkTarget(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:|tel:|sms:|lexgo:\/\/)/i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return `lexgo:/${url}`;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]|$)/i.test(url)) return `https://${url}`;
  return null;
}

export const openUrl = (url: string) => {
  const to = linkTarget(url);
  if (to) void Linking.openURL(to).catch(() => {});
};
