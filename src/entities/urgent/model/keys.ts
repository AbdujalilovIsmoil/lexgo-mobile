// Every query of the module starts with "urgent", so one invalidate refreshes lists, details and the pool.
export const urgentKeys = {
  all: ["urgent"] as const,
  catalog: ["urgent", "catalog"] as const,
  mine: ["urgent", "mine"] as const,
  assigned: ["urgent", "assigned"] as const,
  queue: ["urgent", "queue"] as const,
  detail: ["urgent", "detail"] as const,
  cand: ["urgent", "cand"] as const,
};
