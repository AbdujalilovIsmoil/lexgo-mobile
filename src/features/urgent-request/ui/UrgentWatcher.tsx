import { useRef } from "react";
import { useUrgentLive } from "@/entities/urgent";
import { toast } from "@/shared/ui";
import { successHaptic } from "@/shared/lib/haptics";
import { asStr } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { eventKey } from "../model/eventText";

// Mounted once at the app root (core/providers/mounts/UrgMounts): every urgent frame refreshes the open screens,
// and the moments that matter are said aloud.
export function UrgentWatcher() {
  const { t } = useT();
  const seen = useRef<Record<string, number>>({});
  useUrgentLive((e) => {
    const key = eventKey(e);
    if (!key) return;
    const id = `${key}:${asStr(e.record_id ?? e.id)}`;
    if (Date.now() - (seen.current[id] ?? 0) < 4000) return;
    seen.current[id] = Date.now();
    successHaptic();
    toast(t(`ug10.ev.${key}`), "info");
  });
  return null;
}
