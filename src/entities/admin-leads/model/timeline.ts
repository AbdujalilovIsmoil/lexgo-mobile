import { humanizeSlug } from "@/shared/lib/format";
import type { TimelineItem } from "./types";

type T = (key: string, p?: Record<string, string | number>) => string;

// One timeline entry as a sentence: moves name both stages, other types come from admLeadsB.tl.
export function timelineLabel(t: T, it: TimelineItem, titleOf: (key: string) => string): string {
  if (it.type === "kanban_move") return `${t("admLeadsB.tl.kanban_move")}: ${titleOf(it.from)} → ${titleOf(it.to)}`;
  const path = `admLeadsB.tl.${it.type.replace(/[^a-z0-9_]/g, "_")}`;
  return t(path) !== path ? t(path) : humanizeSlug(it.type);
}
