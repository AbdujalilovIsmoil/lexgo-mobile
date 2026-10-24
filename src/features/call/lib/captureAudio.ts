import { Track, type Room } from "livekit-client";

/** The other people's voices on or off: on the server (it stops sending them) and on this phone at once (no sound in between). */
export function setRemoteVoices(room: Room, on: boolean): void {
  for (const p of room.remoteParticipants.values()) {
    for (const pub of p.audioTrackPublications.values()) {
      pub.setEnabled(on);
      const t = pub.track?.mediaStreamTrack;
      if (t && pub.kind === Track.Kind.Audio) t.enabled = on;
    }
  }
}
