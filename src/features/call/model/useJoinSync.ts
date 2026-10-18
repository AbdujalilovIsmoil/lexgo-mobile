import { useEffect, useRef } from "react";
import { joinCall } from "@/entities/call";
import { ApiError } from "@/shared/api";

// POST …/join (TZ 24 step 4): once LiveKit is connected the backend is told this person is in the call
// (roster status "joined", host/participant events for everybody else). Sent once per connection; a 409 means the
// meeting ended meanwhile. A failed join is retried once, then ignored — the media works without it.
export function useJoinSync(roomId: string, callId: string, connected: boolean, onEnded: () => void): void {
  const sent = useRef("");
  useEffect(() => {
    const key = `${roomId}:${callId}`;
    if (!connected || sent.current === key) return;
    sent.current = key;
    const run = (retry: boolean) => joinCall(roomId, callId).catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 409) onEnded();
      else if (retry) setTimeout(() => void run(false), 2500);
    });
    void run(true);
  }, [roomId, callId, connected, onEnded]);
}
