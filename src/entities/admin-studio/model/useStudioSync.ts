import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents, type UserEvent } from "@/shared/realtime";
import { asDict } from "@/shared/lib/json";
import { studioKeys } from "./queries";

const pick = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

// Which object a studio.* event is about (the payload may sit at the top level, under `data`, or under `object`).
export function eventObjectId(e: UserEvent): string {
  const d = asDict(e.data && typeof e.data === "object" ? e.data : e);
  return pick(d.object_id) || pick(d.objectId) || pick(asDict(d.object).id) || pick(e.object_id);
}

// Realtime for every Studio screen (the user socket pushes studio.*): monitoring rows, the open object, its comments and the
// lists / counters refetch when something changes, instead of polling. A reconnect refetches everything once.
export function useStudioSync(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const soon = useCallback((fn: () => void) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(fn, 400);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents("studio.", (e) => {
    const K = studioKeys.all;
    const id = eventObjectId(e);
    const hit = (key: string, ...rest: string[]) => void qc.invalidateQueries({ queryKey: [...K, key, ...rest] });
    if (e.event === "studio.activity" || e.event === "studio.activity_ended") return soon(() => hit("monitoring"));
    if (e.event === "studio.comment_created") return id ? hit("comments", id) : hit("comments");
    soon(() => {
      if (id) hit("object", id);
      else hit("object");
      for (const k of ["objects", "counts", "mine", "approvals"]) hit(k);
    });
  });
  useResync(() => void qc.invalidateQueries({ queryKey: studioKeys.all }));
}
