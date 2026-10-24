import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { meetKeys, useCallMeta } from "@/entities/call";
import { useSession } from "@/entities/session";
import { callPhase, RING_TIMEOUT_MS } from "../lib/callPhase";
import { useCallClock } from "./useCallClock";
import { useCallCredentials } from "./useCallCredentials";
import { useCallSocket } from "./useCallSocket";
import { useHostMute } from "./useHostMute";
import { useJoinSync } from "./useJoinSync";
import { useLiveKitRoom } from "./useLiveKitRoom";
import { useLocalMedia } from "./useLocalMedia";
import { usePauseSync } from "./usePauseSync";
import { useQualityLadder } from "./useQualityLadder";

const OVER = ["ended", "cancelled", "expired"];

// Everything the call screen needs, wired together: credentials → LiveKit room → live roster / limits
// (polled every 15 s and refreshed by socket events) → controls, clock, quality ladder, empty-room grace.
export function useCallScreen(roomId: string, callId: string, onData: (payload: Uint8Array, from?: { identity: string }) => void) {
  const router = useRouter();
  const qc = useQueryClient();
  const myId = useSession()?.user.id ?? "";
  const creds = useCallCredentials(roomId, callId);
  const [over, setOver] = useState(false);
  const [hadRemote, setHadRemote] = useState(false);
  const metaQ = useCallMeta(roomId, callId, 15_000, !!creds.call);
  const call = metaQ.data ?? creds.call;
  const quality = call?.quality ?? creds.call?.quality ?? null;
  const videoAllowed = quality ? quality.videoEnabled : call?.type === "video";
  const lk = useLiveKitRoom(creds.call, { onData, onJoin: () => setHadRemote(true), onLeave: () => undefined, onQuality: (q) => ladderRef.current(q) });
  const media = useLocalMedia(lk.room, call, { roomId, callId, myId }, () => void metaQ.refetch());
  useJoinSync(roomId, callId, lk.status === "live" || lk.status === "ringing", () => setOver(true));
  const ladder = useQualityLadder(lk.room, quality, media.wanted, media.facing, !!call?.paused);
  const ladderRef = useRef(ladder);
  useEffect(() => { ladderRef.current = ladder; });
  const clock = useCallClock(call, metaQ.dataUpdatedAt > creds.at ? metaQ.dataUpdatedAt : creds.at, lk.status === "live" || lk.status === "ringing");
  // A paused meeting is one somebody waits on: re-read it every 3 s (as the web does) on top of the 15 s poll and the socket.
  const paused = !!call?.paused;
  const refetchMeta = metaQ.refetch;
  useEffect(() => {
    if (!paused) return;
    const id = setInterval(() => void refetchMeta(), 3000);
    return () => clearInterval(id);
  }, [paused, refetchMeta]);
  const signal = useCallSocket(roomId, callId, !!creds.call, { onMeta: () => void metaQ.refetch(), onEnded: () => setOver(true) });
  usePauseSync(lk.room, !!call?.paused, media.wanted);
  const leave = useCallback(() => {
    void qc.invalidateQueries({ queryKey: meetKeys.mine });
    if (router.canGoBack()) router.back();
    else router.replace("/meetings" as never);
  }, [qc, router]);
  const remotes = lk.room?.remoteParticipants.size ?? 0;
  const [stayed, setStayed] = useState(false);
  const alone = hadRemote && remotes === 0 && !stayed && (lk.status === "live" || lk.status === "ringing");
  const me = call?.participants.find((p) => p.userId === myId);
  const locked = useHostMute(lk.room, me?.mic);
  const gone = !!me && (me.status === "removed" || me.status === "left");
  const ended = over || (!!call && OVER.includes(call.status)) || gone;
  // LiveKit gave up on the connection but the meeting itself goes on: offer to rejoin instead of "ended".
  const dropped = lk.status === "ended" && !ended;
  // Caller side: ring for at most RING_TIMEOUT_MS, then the phase turns "missed" (the screen hangs the call up).
  const isCaller = !!call && call.callerId === myId;
  const [timedOut, setTimedOut] = useState(false);
  const ringing = isCaller && lk.status === "ringing" && !hadRemote;
  useEffect(() => {
    if (!ringing) return;
    const id = setTimeout(() => setTimedOut(true), RING_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [ringing]);
  const others = (call?.participants ?? []).filter((p) => p.userId !== myId);
  const phase = callPhase({ link: lk.status, callStatus: call?.status ?? "active", over, isCaller, others, hadRemote, timedOut });
  return { myId, creds, call, quality, videoAllowed: !!videoAllowed, lk, media, clock, alone, stay: () => setStayed(true), signal, ended, dropped, phase, isCaller, locked, refetch: () => void metaQ.refetch(), leave, me };
}
