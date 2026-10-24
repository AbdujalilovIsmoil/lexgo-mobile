import { useEffect } from "react";
import { RoomEvent, type Room } from "livekit-client";
import { useScreenCaptured } from "@/shared/guard";

// While the screen is recorded or mirrored, the other people's voices are not played: the picture is already black (the call page's
// screen guard), and this keeps the voices out of the recording too. They come back when the recording stops.
export function useCaptureMute(room: Room | null): boolean {
  const captured = useScreenCaptured();
  useEffect(() => {
    if (!room) return;
    const apply = () => {
      for (const p of room.remoteParticipants.values()) for (const pub of p.audioTrackPublications.values()) pub.setEnabled(!captured);
    };
    apply();
    room.on(RoomEvent.TrackSubscribed, apply); // a voice that joins during the recording stays silent too
    return () => {
      room.off(RoomEvent.TrackSubscribed, apply);
    };
  }, [room, captured]);
  return captured;
}
