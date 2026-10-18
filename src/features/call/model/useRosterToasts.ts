import { useEffect, useRef } from "react";
import type { Participant } from "@/entities/call";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// Tells the caller who joined, left or declined (the roster changes arrive with the call.participant_* events).
export function useRosterToasts(roster: Participant[] | undefined, myId: string): void {
  const { t } = useT();
  const seen = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    if (!roster) return;
    const prev = seen.current;
    seen.current = new Map(roster.map((p) => [p.userId, p.status]));
    if (!prev) return; // the first snapshot is the starting point, not news
    for (const p of roster) {
      const was = prev.get(p.userId);
      if (p.userId === myId || was === p.status) continue;
      const name = p.name || t("admMeet.someone");
      if (p.status === "declined") toast(t("ms5.declinedBy", { name }), "err");
      else if (p.status === "joined" && was) toast(t("ms5.joined", { name }), "info");
      else if (p.status === "left" && was === "joined") toast(t("ms5.left", { name }), "info");
    }
  }, [roster, myId, t]);
}
