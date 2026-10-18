// All organization queries start with "org" so one invalidate refreshes everything of the owner area.
export const orgKeys = {
  all: ["org"] as const,
  list: ["org", "list"] as const,
  candidates: ["org", "candidates"] as const,
  members: (org: string) => ["org", org, "members"] as const,
  dashboard: (org: string) => ["org", org, "dashboard"] as const,
  stats: (org: string) => ["org", org, "stats"] as const,
  workload: (org: string, member: string, status: string) => ["org", org, "workload", member, status] as const,
  services: (org: string, member: string) => ["org", org, "services", member] as const,
  packages: ["org", "packages"] as const,
};
