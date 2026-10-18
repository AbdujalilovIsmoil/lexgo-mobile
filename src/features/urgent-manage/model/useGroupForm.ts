import { useState } from "react";
import { ApiError } from "@/shared/api";
import { assignRefusal, useAssignGroup, type UrgentRequest } from "@/entities/urgent";
import { isDate } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { isTime } from "./maskTime";

// Pick the panel of a group second opinion, optionally schedule it, and deal with the backend's refusals
// (a wrong size / off-direction advocate can be overridden on purpose, below-minimum cannot).
export function useGroupForm(req: UrgentRequest, onDone: () => void) {
  const { t } = useT();
  const [ids, setIds] = useState<string[]>(req.groupLawyerUserIds);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [okCount, setOkCount] = useState(false);
  const [okDir, setOkDir] = useState(false);
  const [offer, setOffer] = useState<"" | "count" | "direction">("");
  const [err, setErr] = useState("");
  const m = useAssignGroup();
  const want = req.lawyerCount || 2;
  const full = !okCount && ids.length >= want;
  const toggle = (uid: string) => setIds((cur) => (cur.includes(uid) ? cur.filter((x) => x !== uid) : (!okCount && cur.length >= want) || cur.length >= 7 ? cur : [...cur, uid]));

  const submit = async () => {
    if (!ids.length) return;
    if ((date || time) && !(isDate(date) && isTime(time))) return setErr(t("ug9.badSchedule"));
    setErr("");
    // The operator picks a local wall clock; the time is optional (without it the record becomes in_progress).
    const scheduledAt = date && time ? new Date(`${date}T${time}:00`).toISOString() : undefined;
    try {
      await m.mutateAsync({ id: req.id, input: { lawyerUserIds: ids, scheduledAt, note: note.trim(), allowCount: okCount, allowDirection: okDir } });
      toast(t("ug9.done", { n: ids.length }), "ok");
      onDone();
    } catch (e) {
      const r = assignRefusal(e);
      setOffer(r?.kind === "count" || r?.kind === "direction" ? r.kind : "");
      if (r?.kind === "minimum") setErr(t("ug9.belowMinimum", { min: r.count, got: r.selected || ids.length }));
      else if (r?.kind === "count") setErr(t("ug9.countMismatch", { want: r.requested || want, got: r.selected || ids.length }));
      else if (r?.kind === "direction") setErr(t("ug9.directionMismatch", { n: r.count }));
      else setErr(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"));
    }
  };
  return { ids, want, full, toggle, date, setDate, time, setTime, note, setNote, okCount, setOkCount, okDir, setOkDir, offer, err, submit, pending: m.isPending };
}
export type GroupForm = ReturnType<typeof useGroupForm>;
