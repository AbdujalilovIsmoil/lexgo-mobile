import { useQuery } from "@tanstack/react-query";
import { getIntegrations } from "../api/integrationApi";
import type { Integration, IntegrationGroup } from "./types";

export const integrationKeys = { all: ["admin-integrations"] as const };

export const useIntegrations = () => useQuery({ queryKey: integrationKeys.all, queryFn: getIntegrations, refetchInterval: 60_000 });

// Group by backend category, keeping the order the backend returns them in.
export function groupByCategory(items: Integration[]): IntegrationGroup[] {
  const groups: IntegrationGroup[] = [];
  for (const i of items) {
    const g = groups.find((x) => x.category === i.category);
    if (g) g.items.push(i);
    else groups.push({ category: i.category, items: [i] });
  }
  return groups;
}

export type Tone = "ok" | "warn" | "err" | "gray";
// queued / pending = waiting for provider delivery (amber); errors red; unknown stays grey.
export function integrationTone(i: Pick<Integration, "status" | "healthy">): Tone {
  if (i.status === "connected" || i.healthy) return "ok";
  if (["degraded", "queued", "pending"].includes(i.status)) return "warn";
  if (["error", "failed", "disconnected"].includes(i.status)) return "err";
  return "gray";
}

// Narrow the tiles by tone ("all" keeps everything) and by a free-text word match on name / key / category.
export function filterIntegrations(items: Integration[], tone: string, q: string): Integration[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((i) => (tone === "all" || integrationTone(i) === tone) && words.every((w) => `${i.label} ${i.key} ${i.category} ${i.status}`.toLowerCase().includes(w)));
}
