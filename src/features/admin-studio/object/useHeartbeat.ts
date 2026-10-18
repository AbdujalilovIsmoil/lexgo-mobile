import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { endActivity, heartbeat, isRouteMissing } from "@/entities/admin-studio";
import { isForbidden } from "@/shared/api";

const EVERY_MS = 25_000;
type Opts = { enabled: boolean; code: string; objectId: string; versionId: string; name: string };

// "Who is editing what" for the monitoring screen: a heartbeat every 25 s while the app is
// in the foreground, the session is closed on leave. markSaved() adds a save to the next beat.
export function useHeartbeat(o: Opts) {
  const meta = useRef(o);
  const saves = useRef(0);
  useEffect(() => void (meta.current = o));
  useEffect(() => {
    if (!o.enabled || !o.code) return;
    let sid = "";
    let closed = false;
    let dead = false;
    const beat = async () => {
      if (dead || closed || AppState.currentState !== "active") return;
      const delta = saves.current;
      saves.current = 0;
      try {
        const m = meta.current;
        const id = await heartbeat({ sessionId: sid, code: m.code, objectId: m.objectId, versionId: m.versionId, saves: delta, name: m.name });
        if (closed) void endActivity(id).catch(() => undefined);
        else sid = id || sid;
      } catch (e) {
        saves.current += delta;
        if (isRouteMissing(e) || isForbidden(e)) dead = true;
      }
    };
    const timer = setInterval(() => void beat(), EVERY_MS);
    const sub = AppState.addEventListener("change", (s) => s === "active" && void beat());
    void beat();
    return () => {
      closed = true;
      clearInterval(timer);
      sub.remove();
      if (sid) void endActivity(sid).catch(() => undefined);
    };
  }, [o.enabled, o.code, o.objectId]);
  return { markSaved: () => void (saves.current += 1) };
}
