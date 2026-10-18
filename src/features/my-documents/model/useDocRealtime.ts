import { useCallback, useEffect, useRef } from "react";
import { useIsFocused } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { docEventOf, docKeys, type DocEvent } from "@/entities/my-document";

const EVENTS = ["document_request.", "support.assist_document_request_created", "notification.created", "document_review_payment_required", "document_review_payment_approved", "document_review_payment_rejected"];
const TOAST: Partial<Record<DocEvent["kind"], string>> = { ready: "dm10.rt.ready", claimed: "dm10.rt.claimed", meeting: "dm10.rt.meeting", pooled: "dm10.rt.pooled", rejected: "dm10.rt.rejected", created: "dm10.rt.created", required: "dm10.rt.required" };

// document_request.* events (claimed, ready, meeting_created, payment approved…) refresh the
// list and every open detail; a socket reconnect re-syncs once. No polling.
export function useDocRealtime() {
  const qc = useQueryClient();
  const { t } = useT();
  const focused = useIsFocused();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refresh = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void qc.invalidateQueries({ queryKey: docKeys.all }), 600);
  }, [qc]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents(EVENTS, (e) => {
    const ev = docEventOf(e);
    if (!ev) return;
    // Wrapped notifications get their toast from the notification layer; only the visible screen toasts.
    const key = e.event === "notification.created" ? undefined : TOAST[ev.kind];
    if (key && focused) toast(t(key), ev.kind === "rejected" ? "err" : "ok");
    refresh();
  });
  useResync(refresh);
}
