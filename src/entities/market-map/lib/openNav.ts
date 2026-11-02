import { Linking } from "react-native";
import type { NavMode, Navigation } from "../model/types";

// The order of the contract: Yandex Navigator for driving, then Yandex Maps (app_url / app_urls.yandex_maps), then the web fallback in the
// browser. openURL rejects when no app handles the scheme, which is how a missing app is detected (no manifest <queries> needed).
export function navCandidates(n: Navigation, mode: NavMode): string[] {
  const list = [mode === "driving" ? n.navigatorUrl : "", n.mapsUrl, n.appUrl, n.fallbackUrl].filter(Boolean);
  return [...new Set(list)];
}

export async function openNavigation(n: Navigation, mode: NavMode, open: (url: string) => Promise<unknown> = (u) => Linking.openURL(u)): Promise<string> {
  for (const url of navCandidates(n, mode)) {
    try {
      await open(url);
      return url;
    } catch {
      // not installed: try the next one
    }
  }
  throw new Error("navigation_unavailable");
}
