import type { Availability, Deadlines } from "../model/types";

export const toMin = (hm: string): number => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

export const fromMin = (n: number): string => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

// A day is valid when it is off, or ends after it starts (HH:MM, 24 h).
export const dayValid = (d: { enabled: boolean; start: string; end: string }) => !d.enabled || toMin(d.start) < toMin(d.end);

export const deadlineValid = (n: number) => Number.isInteger(n) && n >= 1 && n <= 1440;

export type AvailabilityIssue = "hours" | "deadline" | "noDay";

// What blocks saving the schedule (a seller with no working day would never get an order).
export function issuesOf(a: Availability): AvailabilityIssue[] {
  const out: AvailabilityIssue[] = [];
  if (a.weekly.some((d) => !dayValid(d))) out.push("hours");
  if (!a.weekly.some((d) => d.enabled)) out.push("noDay");
  if (!(["manual", "auto", "sos"] as (keyof Deadlines)[]).every((k) => deadlineValid(a.deadlines[k]))) out.push("deadline");
  return out;
}

export const sameAvailability = (a: Availability, b: Availability) =>
  JSON.stringify([a.weekly, a.deadlines]) === JSON.stringify([b.weekly, b.deadlines]);
