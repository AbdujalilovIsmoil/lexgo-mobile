import { useEffect } from "react";
import { AppState } from "react-native";
import { getSecurityProfile } from "@/entities/security";

// While the user finishes in Telegram: read /auth/me every 5 s (and when the app comes back to the
// foreground) until the bot has stored the chat. `onLinked` / `onUnknown` must be stable callbacks;
// `onUnknown` fires when the backend does not expose the link state at all.
export function useTelegramPoll(active: boolean, expiresAt: number, onLinked: () => void, onUnknown: () => void) {
  useEffect(() => {
    if (!active) return;
    let alive = true;
    const check = async () => {
      try {
        const p = await getSecurityProfile();
        if (!alive) return;
        if (p.telegramLinked === undefined) onUnknown();
        else if (p.telegramLinked) onLinked();
      } catch {
        /* try again on the next tick */
      }
    };
    const iv = setInterval(() => (Date.now() > expiresAt + 5000 ? clearInterval(iv) : void check()), 5000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && void check());
    return () => {
      alive = false;
      clearInterval(iv);
      sub.remove();
    };
  }, [active, expiresAt, onLinked, onUnknown]);
}
