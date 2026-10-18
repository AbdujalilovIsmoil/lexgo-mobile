import { useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";

// The backend only records the host's mute on my roster row; this client acts on it: my mic goes off and
// stays locked until the roster says it is allowed again. My own mute (which also lands on the roster)
// is not mistaken for a host action because the local track is already off by then.
export function useHostMute(room: Room | null, rosterMic: boolean | undefined): boolean {
  const [locked, setLocked] = useState(false);
  const prev = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    const lp = room?.localParticipant;
    if (rosterMic === undefined || !lp) return;
    if (prev.current === true && rosterMic === false && lp.isMicrophoneEnabled) {
      void lp.setMicrophoneEnabled(false).catch(() => undefined);
      setLocked(true);
    }
    // Syncing with an external system (the LiveKit track + the backend roster), hence setState in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rosterMic) setLocked(false);
    prev.current = rosterMic;
  }, [rosterMic, room]);
  return locked;
}
