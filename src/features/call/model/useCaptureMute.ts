import { useEffect, useRef } from "react";
import { RoomEvent, type Room } from "livekit-client";
import { useScreenCaptured } from "@/shared/guard";
import { setRemoteVoices } from "../lib/captureAudio";

// While the screen is recorded or mirrored — also when the recording was already running before the call began — no voice goes into
// it: the picture is already black (the call page's screen guard), the other people's audio is switched off (on the server, and on this
// phone at once, so not even the first moments play), and this phone's microphone is off. The person cannot switch the microphone back
// on (the call screen refuses); everything comes back as it was when the recording stops.
export function useCaptureMute(room: Room | null): boolean {
  const captured = useScreenCaptured();
  useEffect(() => {
    if (!room) return;
    const apply = () => setRemoteVoices(room, !captured);
    apply();
    room.on(RoomEvent.TrackSubscribed, apply); // a voice that joins during the recording stays silent too
    return () => {
      room.off(RoomEvent.TrackSubscribed, apply);
    };
  }, [room, captured]);
  const micWas = useRef<boolean | null>(null); // the microphone before the recording, to give it back afterwards
  useEffect(() => {
    const lp = room?.localParticipant;
    if (!lp) return;
    if (captured) {
      if (micWas.current === null) micWas.current = lp.isMicrophoneEnabled;
      void lp.setMicrophoneEnabled(false).catch(() => undefined);
    } else if (micWas.current !== null) {
      const was = micWas.current;
      micWas.current = null;
      if (was) void lp.setMicrophoneEnabled(true).catch(() => undefined);
    }
  }, [room, captured]);
  return captured;
}
