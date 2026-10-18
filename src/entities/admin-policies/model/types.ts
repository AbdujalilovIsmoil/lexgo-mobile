import type { Dict } from "@/shared/lib/json";

export const SECTIONS = ["order", "payment", "document_analysis", "workspace", "security", "notifications"] as const;
export type Section = (typeof SECTIONS)[number];
export const PRICING = "marketplace_pricing";
export type PolicySection = Section | typeof PRICING;

export type HistoryEntry = { id: string; version: string; changedBy: string; at: string; previous: Dict | null; current: Dict | null };
export type ReadinessItem = { key: string; title: string; status: string; note: string };
export type Readiness = { status: string; passed: number; total: number; items: ReadinessItem[]; raw: Dict };
export type UnverifiedMode = "badge" | "hidden";

export type BusinessHours = { timezone: string; days: string[]; start: string; end: string; isWorkingTime: boolean | null; holidays: string[] };
export type Simulation = { isWorkingDay: boolean; isWorkingTime: boolean; nextWorkStart: string; deadline30: string };
