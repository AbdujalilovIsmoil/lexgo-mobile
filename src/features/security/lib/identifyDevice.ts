import { listSessions } from "@/entities/security";
import { authApi, useSessionStore } from "@/entities/session";

// The backend marks no "current device" in /auth/sessions. /auth/refresh touches only THIS session's
// last_used_at, so: list -> refresh -> list, and the row that moved is this device. If another device
// of the same account moved at the same instant, repeat and keep the rows that moved every time
// (at most 3 rounds). Remembered (SecureStore) for the rest of the session; never guessed.
export async function identifyDevice(): Promise<boolean> {
  const s = useSessionStore.getState().session;
  if (!s?.refreshToken) return false;
  if (s.sid) return true;
  try {
    let candidates: string[] | null = null;
    for (let round = 0; round < 3; round++) {
      const before = await listSessions();
      await authApi.refresh(s.refreshToken); // the answer's tokens are dropped: the stored ones stay valid
      const moved = (await listSessions()).filter((a) => before.some((b) => b.id === a.id && b.lastUsedAt !== a.lastUsedAt)).map((a) => a.id);
      candidates = candidates ? candidates.filter((id) => moved.includes(id)) : moved;
      if (candidates.length === 1) {
        await useSessionStore.getState().setSessionId(candidates[0]);
        return true;
      }
      if (!candidates.length) return false;
    }
  } catch {
    /* offline: try again next time the tab opens */
  }
  return false;
}
