import type { IconName } from "@/shared/ui";

export type StatItem = {
  key: string;
  icon: IconName;
  value: number;
  suffix: string;
  labelKey: string;
  colors: [string, string];
};

// Platform proof points (all counted from the backend), each with its own accent. `value` is filled from the API (useHomeStats).
export const STATS: StatItem[] = [
  { key: "lawyers", icon: "users", value: 0, suffix: "", labelKey: "home.stats.lawyers", colors: ["#1668F0", "#5CA8FF"] },
  { key: "templates", icon: "file-text", value: 0, suffix: "", labelKey: "home.stats.templates", colors: ["#00A6E6", "#00CFE8"] },
  { key: "coverage", icon: "map-pin", value: 0, suffix: "", labelKey: "home.stats.coverage", colors: ["#7A5CFF", "#B7A4FF"] },
];
