import { useCallback, useEffect, useRef, useState } from "react";
import { Room, type ConnectionQuality, type RemoteParticipant } from "livekit-client";
import type { Call } from "@/entities/call";
import { startAudio, stopAudio } from "../lib/audioRoute";
import { askMediaAccess } from "../lib/permissions";
import { publishLocal } from "../lib/publish";
import { wireRoom } from "../lib/roomEvents";
import { buildRoomOptions } from "../lib/roomOptions";

export type RoomStatus = "connecting" | "ringing" | "live" | "reconnecting" | "ended" | "error";
type Opts = { onData: (payload: Uint8Array, from?: RemoteParticipant) => void; onQuality: (q: ConnectionQuality) => void; onJoin: (p: RemoteParticipant) => void; onLeave: (p: RemoteParticipant) => void };

// Owns one LiveKit Room for the life of the screen: connect once, publish once, drop everything on unmount.
// `tick` changes whenever anything visible changed (coalesced to ~7 re-renders a second).
export function useLiveKitRoom(call: Call | null, opts: Opts) {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [tick, setTick] = useState(0);
  const [denied, setDenied] = useState({ mic: false, cam: false });
  const hooks = useRef(opts);
  useEffect(() => { hooks.current = opts; });
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bump = useCallback(() => { if (!pending.current) pending.current = setTimeout(() => { pending.current = undefined; setTick((n) => n + 1); }, 140); }, []);
  const token = call?.livekitToken ?? "";

  useEffect(() => {
    if (!call || !token) return;
    let alive = true;
    const quality = call.quality;
    const video = quality ? quality.videoEnabled : call.type === "video";
    const r = new Room(buildRoomOptions(quality));
    wireRoom(r, {
      bump,
      onJoin: (p) => { setStatus("live"); hooks.current.onJoin(p); },
      onLeave: (p) => { setStatus(r.remoteParticipants.size ? "live" : "ringing"); hooks.current.onLeave(p); },
      onLink: (s) => alive && setStatus(s === "connected" ? (r.remoteParticipants.size ? "live" : "ringing") : s === "ended" ? "ended" : "reconnecting"),
      onData: (payload, from) => hooks.current.onData(payload, from),
      onQuality: (q) => hooks.current.onQuality(q),
    });
    (async () => {
      try {
        const access = await askMediaAccess(video);
        await startAudio();
        await r.connect(call.livekitUrl, token, { autoSubscribe: true });
        if (!alive) return;
        setRoom(r);
        setStatus(r.remoteParticipants.size ? "live" : "ringing");
        const res = await publishLocal(r, quality, video, access);
        if (alive) { setDenied({ mic: res.micFailed, cam: res.camFailed }); bump(); }
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
      clearTimeout(pending.current);
      pending.current = undefined;
      r.removeAllListeners();
      void r.disconnect();
      void stopAudio();
      setRoom(null);
      setStatus("connecting");
    };
    // Connect exactly once per credentials; the backend treats repeated connect / publish cycles as a negotiation loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return { room, status, tick, denied, bump };
}
