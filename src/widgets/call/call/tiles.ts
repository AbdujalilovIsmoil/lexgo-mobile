import { Track, type Participant, type Room, type TrackPublication } from "livekit-client";
import type { Participant as Rostered } from "@/entities/call";

export type Tile = { id: string; key: string; p: Participant; name: string; local: boolean; share: boolean; pub?: TrackPublication; speaking: boolean; mic: boolean };

const live = (pub?: TrackPublication) => (pub && pub.track && !pub.isMuted ? pub : undefined);

/** One tile per person (camera or avatar) plus one per screen share, from the LiveKit room and the backend roster. */
export function buildTiles(room: Room | null, roster: Rostered[], fallback: string): Tile[] {
  if (!room) return [];
  const nameOf = (p: Participant) => roster.find((r) => r.userId === p.identity)?.name || p.name || fallback;
  const people = [room.localParticipant, ...room.remoteParticipants.values()];
  const out: Tile[] = [];
  for (const p of people) {
    const share = live(p.getTrackPublication(Track.Source.ScreenShare));
    if (share) out.push({ id: p.identity, key: `${p.identity}:s`, p, name: nameOf(p), local: p.isLocal, share: true, pub: share, speaking: false, mic: p.isMicrophoneEnabled });
    out.push({ id: p.identity, key: p.identity, p, name: nameOf(p), local: p.isLocal, share: false, pub: live(p.getTrackPublication(Track.Source.Camera)), speaking: p.isSpeaking, mic: p.isMicrophoneEnabled });
  }
  return out;
}
