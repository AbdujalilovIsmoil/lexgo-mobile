import { useEffect, useRef } from "react";
import { joinCall, patchParticipant } from "@/entities/call";
import { useSession } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { deviceId } from "@/shared/push";

// POST …/join (TZ 24 step 4): once LiveKit is connected the backend is told this person is in the call
// (roster status "joined", host/participant events for everybody else). Sent once per connection; a 409 means the
// meeting ended meanwhile. A failed join is retried once, then ignored — the media works without it.
export function useJoinSync(roomId: string, callId: string, connected: boolean, onEnded: () => void): void {
  const sent = useRef("");
  const me = useSession()?.user.id ?? "";
  useEffect(() => {
    const key = `${roomId}:${callId}`;
    if (!connected || sent.current === key) return;
    sent.current = key;
    // Answering from this phone: the participant status "joined" carries this device's id, so the user's other devices stop ringing.
    const answer = async () => {
      const d = await deviceId();
      if (d && me) await patchParticipant(roomId, callId, me, { status: "joined", answered_device_id: d }).catch(() => undefined);
    };
    const run = (retry: boolean) => answer().then(() => joinCall(roomId, callId)).catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 409) onEnded();
      else if (retry) setTimeout(() => void run(false), 2500);
    });
    void run(true);
  }, [roomId, callId, connected, onEnded, me]);
}
