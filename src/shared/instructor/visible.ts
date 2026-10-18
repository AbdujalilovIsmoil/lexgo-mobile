import { currentPath } from "./pathStore";
import { inWindow } from "./measure";
import { allTargets } from "./registry";
import type { TargetDecl, VisibleTarget } from "./types";

const LIMIT = 120; // backend `accepted_targets_limit`

// Every mounted target of the front screen that is laid out; the ones on screen right now come first.
export async function visibleTargets(): Promise<VisibleTarget[]> {
  const rows = await Promise.all(allTargets().map(async (t) => ({ t, rect: await t.measure() })));
  const seen = new Set<string>();
  const out: VisibleTarget[] = [];
  for (const { t, rect } of rows) {
    if (!rect || seen.has(t.id)) continue;
    seen.add(t.id);
    out.push({ id: t.id, label: t.label, type: t.type, inView: inWindow(rect) });
  }
  return [...out.filter((x) => x.inView), ...out.filter((x) => !x.inView)].slice(0, LIMIT);
}

export const targetDecls = (list: VisibleTarget[]): TargetDecl[] => list.map((x) => ({ ai_id: x.id, type: x.type, label: x.label, route: currentPath() }));
