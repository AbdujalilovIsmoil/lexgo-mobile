import type { ThemeColors } from "@/shared/theme";
import type { IconName } from "@/shared/ui";
import type { ServiceStatus } from "../model/types";

// Icon and colour of a service status (hero chips, status cards, list cards).
export const STATUS_ICON: Record<ServiceStatus, IconName> = { active: "play", paused: "pause", inactive: "power" };
export const statusColor = (c: ThemeColors, s: ServiceStatus): string => (s === "active" ? c.ok : s === "paused" ? c.warn : c.gray2);
export const statusBg = (c: ThemeColors, s: ServiceStatus): string => (s === "active" ? c.okBg : s === "paused" ? c.warnBg : c.surface2);
