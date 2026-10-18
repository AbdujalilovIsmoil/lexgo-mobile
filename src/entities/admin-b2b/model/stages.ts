import { humanizeSlug } from "@/shared/lib/format";
import type { PillTone } from "@/shared/ui";

export const STAGES = ["discovered", "contacted", "meeting", "diagnostics", "proposal", "negotiation", "contract", "active", "renewal", "lost"];

export const stageTone = (stage: string): PillTone => (stage === "lost" ? "err" : stage === "active" || stage === "renewal" ? "ok" : stage === "negotiation" || stage === "contract" ? "warn" : "blue");

// Stage name in the user's language; stages the backend invents are tidied.
export function stageLabel(t: (key: string) => string, stage: string): string {
  const path = `admB2b.stage.${stage.replace(/[^a-z0-9_]/gi, "_")}`;
  return t(path) !== path ? t(path) : humanizeSlug(stage);
}

const COLORS: Record<string, string> = { discovered: "#94A3B8", contacted: "#3B82F6", meeting: "#06B6D4", diagnostics: "#8B5CF6", proposal: "#F59E0B", negotiation: "#EC4899", contract: "#22C55E", active: "#16A34A", renewal: "#0EA5E9", lost: "#EF4444" };
export const stageColor = (stage: string): string => COLORS[stage] ?? "#64748B";
