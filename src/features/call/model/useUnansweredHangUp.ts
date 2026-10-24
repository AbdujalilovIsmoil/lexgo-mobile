import { useEffect } from "react";
import type { Room } from "livekit-client";
import { endCall } from "@/entities/call";
import { shouldHangUp, type Phase } from "../lib/callPhase";

// Caller side: once nobody can answer (declined / ring timeout) the call is ended for everybody — `call.end` over the
// call websocket and the REST end — so the callee's ringing card goes away. Runs once per phase change.
export function useUnansweredHangUp(phase: Phase, roomId: string, callId: string, room: Room | null, signal: (e: "call.end") => void) {
  useEffect(() => {
    if (!shouldHangUp(phase)) return;
    signal("call.end");
    void room?.disconnect(); // first: the mic stops at once, whatever the REST end takes
    void endCall(roomId, callId).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
