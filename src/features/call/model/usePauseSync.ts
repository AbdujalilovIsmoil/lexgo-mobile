import { useEffect, useRef } from "react";
import type { Room } from "livekit-client";
import type { WantedCtl } from "./useWanted";

// A paused meeting publishes nothing: the tracks are muted (never unpublished — repeated publish cycles
// look like a negotiation loop to the backend) and restored to what they were when the pause lifts.
export function usePauseSync(room: Room | null, paused: boolean, wanted: WantedCtl) {
  const before = useRef<{ mic: boolean; cam: boolean } | null>(null);
  useEffect(() => {
    const lp = room?.localParticipant;
    if (!lp) return;
    if (paused && !before.current) {
      before.current = { mic: lp.isMicrophoneEnabled, cam: lp.isCameraEnabled };
      void lp.setMicrophoneEnabled(false).catch(() => undefined);
      void lp.setCameraEnabled(false).catch(() => undefined);
    } else if (!paused && before.current) {
      const prev = before.current;
      before.current = null;
      if (prev.mic) void lp.setMicrophoneEnabled(true).catch(() => undefined);
      if (prev.cam && wanted.get().cam) void lp.setCameraEnabled(true).catch(() => undefined);
    }
  }, [room, paused, wanted]);
}
