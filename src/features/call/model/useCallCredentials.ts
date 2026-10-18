import { useEffect, useState } from "react";
import { getJoinToken, type Call } from "@/entities/call";
import { ApiError } from "@/shared/api";

export type JoinError = { status: number; detail: string };
type Result = { key: string; call?: Call; at?: number; error?: JoinError };

// GET …/join-token once per attempt (TZ 24): the LiveKit url + token and the call's first snapshot. The roster is
// only touched later, by POST …/join once the room is connected (useJoinSync). 409 = the meeting has ended,
// 404 = it does not exist, 403 = this account may not join. `at` is when the snapshot was taken (the countdown starts there).
export function useCallCredentials(roomId: string, callId: string) {
  const [attempt, setAttempt] = useState(0);
  const [res, setRes] = useState<Result | null>(null);
  const key = `${roomId}:${callId}:${attempt}`;
  useEffect(() => {
    let alive = true;
    getJoinToken(roomId, callId)
      .then((call) => alive && setRes({ key, call, at: Date.now() }))
      .catch((e: unknown) => alive && setRes({ key, error: e instanceof ApiError ? { status: e.status, detail: e.detail ?? "" } : { status: 0, detail: "" } }));
    return () => { alive = false; };
  }, [roomId, callId, key]);
  const cur = res?.key === key ? res : null;
  return { call: cur?.call ?? null, at: cur?.at ?? 0, error: cur?.error ?? null, retry: () => setAttempt((n) => n + 1) };
}
