// GET/PUT /lawyers/me/availability. `day` counts from 0 = Monday.
export type WeeklyDay = { day: number; enabled: boolean; start: string; end: string };
export type Deadlines = { manual: number; auto: number; sos: number }; // minutes to answer an order
export type Availability = {
  timezone: string;
  weekly: WeeklyDay[];
  exceptions: Record<string, unknown>[]; // kept as the server sent them
  deadlines: Deadlines;
  source: "default" | "custom";
};

export const DEFAULT_DEADLINES: Deadlines = { manual: 30, auto: 15, sos: 5 };
export const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
