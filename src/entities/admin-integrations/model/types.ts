export type Integration = {
  key: string;
  label: string;
  category: string;
  status: string;
  healthy: boolean;
  configured: boolean;
  requiresSuperadmin: boolean;
};

// Uzbekistan data residency: "confirmed" only when the backend says so explicitly.
export type Residency = {
  state: "confirmed" | "pending" | "unknown";
  status: string;
  region: string;
  provider: string;
  checkedAt: string;
};

export type IntegrationsOverview = { items: Integration[]; residency: Residency | null };
export type IntegrationGroup = { category: string; items: Integration[] };
