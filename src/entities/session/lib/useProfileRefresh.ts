import { useEffect } from "react";
import { AppState } from "react-native";
import { useSessionStore } from "../model/store";
import { profileAge, refreshProfile } from "./refreshProfile";

const FOREGROUND_GAP_MS = 3 * 60_000;

// Roles, permissions and the account status can change on the server (an admin grants a role, blocks
// the account), so the stored profile is re-read at app start and when the app returns to the
// foreground — never more often than every few minutes.
export function useProfileRefresh(): void {
  const who = useSessionStore((s) => s.session?.user.id); // not the token: it changes on every refresh
  const ready = useSessionStore((s) => s.ready);
  useEffect(() => {
    if (!ready || !who) return;
    void refreshProfile();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && profileAge() > FOREGROUND_GAP_MS) void refreshProfile();
    });
    return () => sub.remove();
  }, [ready, who]);
}
