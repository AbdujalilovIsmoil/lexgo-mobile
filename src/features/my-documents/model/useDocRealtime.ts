import { useCallback, useEffect, useRef } from "react";
import { useIsFocused } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { docEventOf, docKeys, type DocEvent } from "@/entities/my-document";

const EVENTS = ["document_request.", "document_constructor_continue_prompt", "support.assist_document_request_created", "notification.created", "document_review_payment_required", "document_review_payment_approved", "document_review_payment_rejected"];
const TOAST: Partial<Record<DocEvent["kind"], string>> = { ready: "dm10.rt.ready", claimed: "dm10.rt.claimed", meeting: "dm10.rt.meeting", pooled: "dm10.rt.pooled", rejected: "dm10.rt.rejected", created: "dm10.rt.created", required: "dm10.rt.required" };

const COOL = 600; // a burst of events is read as one refresh (the first at once, the last after the pause)
const SAME = 4000; // an event without an identity of its own is "the same one" when its name and records repeat within this long

// document_request.* events (sent, payment, claimed, transferred, draft / editor saved, meeting, ready…) and the constructor prompt refresh the
// list and every open detail at once; a socket reconnect re-syncs once. A notification is shown once per event identity (the same event
// arrives bare and wrapped in notification.created). No polling; one socket is shared by all screens.
export function useDocRealtime() {
  const qc = useQueryClient();
  const { t } = useT();
  const focused = useIsFocused();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const last = useRef(0);
  const seen = useRef(new Map<string, number>());
  const run = useCallback(() => {
    last.current = Date.now();
    void qc.invalidateQueries({ queryKey: docKeys.all });
  }, [qc]);
  const refresh = useCallback(() => {
    clearTimeout(timer.current);
    const wait = last.current + COOL - Date.now();
    if (wait <= 0) run();
    else timer.current = setTimeout(run, wait);
  }, [run]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents(EVENTS, (e) => {
    const ev = docEventOf(e);
    if (!ev) return;
    const now = Date.now();
    const key = ev.uid ? `u:${ev.uid}` : `${ev.name}|${ev.ids.join(",")}`;
    const before = seen.current.get(key);
    const dup = before !== undefined && (ev.uid !== "" || now - before < SAME);
    seen.current.set(key, now);
    if (seen.current.size > 200) seen.current.delete(seen.current.keys().next().value as string);
    // Wrapped notifications get their toast from the notification layer; only the visible screen toasts, and only once per event.
    const text = e.event === "notification.created" || dup ? undefined : TOAST[ev.kind];
    if (text && focused) toast(t(text), ev.kind === "rejected" ? "err" : "ok");
    refresh();
  });
  useResync(refresh);
}
