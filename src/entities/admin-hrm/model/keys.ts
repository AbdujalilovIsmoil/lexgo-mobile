// Every HRM query key starts with this prefix, so one invalidation refreshes the whole module.
export const hrmKeys = { all: ["admin-hrm"] as const };
export const hrmKey = (...rest: unknown[]) => [...hrmKeys.all, ...rest];
