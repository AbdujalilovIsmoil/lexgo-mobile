import { useState } from "react";
import { applyPreset, copyToAll, sameAvailability, type Availability, type Deadlines, type PresetKind, type WeeklyDay } from "@/entities/pro-availability";

// Local edits of the schedule on top of the server copy; `dirty` says whether Save has anything to send.
export function useAvailabilityEdit(server: Availability | undefined) {
  const [edit, setEdit] = useState<Availability | null>(null);
  const cur = edit ?? server;
  const patch = (fn: (a: Availability) => Availability) => cur && setEdit(fn(cur));
  return {
    cur,
    dirty: !!edit && !!server && !sameAvailability(edit, server),
    setDay: (day: number, p: Partial<WeeklyDay>) => patch((a) => ({ ...a, weekly: a.weekly.map((d) => (d.day === day ? { ...d, ...p } : d)) })),
    setDeadline: (k: keyof Deadlines, n: number) => patch((a) => ({ ...a, deadlines: { ...a.deadlines, [k]: n } })),
    preset: (kind: PresetKind) => patch((a) => ({ ...a, weekly: applyPreset(a.weekly, kind) })),
    // The hours of one open day on every day of the week.
    copyAll: (day: number) => patch((a) => ({ ...a, weekly: copyToAll(a.weekly, day) })),
    discard: () => setEdit(null),
  };
}
