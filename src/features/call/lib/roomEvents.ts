import { RoomEvent, type ConnectionQuality, type RemoteParticipant, type Room } from "livekit-client";

export type RoomHooks = {
  bump: () => void;
  onJoin: (p: RemoteParticipant) => void;
  onLeave: (p: RemoteParticipant) => void;
  onLink: (s: "reconnecting" | "connected" | "ended") => void;
  onData: (payload: Uint8Array, from?: RemoteParticipant) => void;
  onQuality: (q: ConnectionQuality) => void;
};

// Wires the LiveKit room to the screen: every roster / track / speaker change bumps one counter,
// the rest are the few events the logic cares about. Cleanup is room.removeAllListeners().
export function wireRoom(r: Room, h: RoomHooks): void {
  const bump = () => h.bump();
  r.on(RoomEvent.ParticipantConnected, (p) => { bump(); h.onJoin(p); })
    .on(RoomEvent.ParticipantDisconnected, (p) => { bump(); h.onLeave(p); })
    .on(RoomEvent.TrackSubscribed, bump)
    .on(RoomEvent.TrackUnsubscribed, bump)
    .on(RoomEvent.TrackMuted, bump)
    .on(RoomEvent.TrackUnmuted, bump)
    .on(RoomEvent.LocalTrackPublished, bump)
    .on(RoomEvent.LocalTrackUnpublished, bump)
    .on(RoomEvent.TrackStreamStateChanged, bump)
    .on(RoomEvent.ActiveSpeakersChanged, bump)
    .on(RoomEvent.ParticipantNameChanged, bump)
    .on(RoomEvent.Reconnecting, () => h.onLink("reconnecting"))
    .on(RoomEvent.Reconnected, () => { h.onLink("connected"); bump(); })
    .on(RoomEvent.Disconnected, () => h.onLink("ended"))
    .on(RoomEvent.DataReceived, (payload, p) => h.onData(payload, p))
    .on(RoomEvent.ConnectionQualityChanged, (q, p) => { if (p.isLocal) h.onQuality(q); });
}
