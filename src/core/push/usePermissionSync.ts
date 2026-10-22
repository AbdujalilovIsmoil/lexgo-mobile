import { useEffect } from "react";
import { AppState } from "react-native";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { translate } from "@/shared/i18n/useT";
import { ensureCallActions, ensureChannels, readPermission } from "@/shared/push";

// Keeps the permission state fresh (start + back from system settings) and the Android channel names and the call notification's
// Join / Decline buttons in the current language.
export function usePermissionSync(): void {
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    void readPermission();
    const sub = AppState.addEventListener("change", (s) => s === "active" && void readPermission());
    return () => sub.remove();
  }, []);
  useEffect(() => {
    void ensureChannels({ default: translate(locale, "nt2.channel.default"), messages: translate(locale, "nt2.channel.messages"), calls: translate(locale, "nt2.channel.calls") });
    void ensureCallActions({ join: translate(locale, "admMeet.join"), decline: translate(locale, "admMeet.decline") });
  }, [locale]);
}
