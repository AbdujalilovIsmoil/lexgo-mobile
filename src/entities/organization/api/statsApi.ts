import { summarize } from "../lib/stats";
import type { OwnerStats, WorkItem } from "../model/workTypes";
import { listWorkload } from "./ownerApi";

const PAGE = 100;
const MAX_PAGES = 5;

// The owner endpoints have no totals for money, so the first 500 orders are summed on the phone.
export async function getOwnerStats(orgId: string): Promise<OwnerStats> {
  const all: WorkItem[] = [];
  let total = 0;
  for (let i = 0; i < MAX_PAGES; i += 1) {
    const page = await listWorkload(orgId, { limit: PAGE, offset: i * PAGE });
    all.push(...page.items);
    total = page.total ?? all.length;
    if (!page.hasMore || !page.items.length) break;
  }
  return summarize(all, total);
}
