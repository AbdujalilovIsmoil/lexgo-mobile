export type AtRiskClient = { id: string; name: string; phone: string; reasons: string[]; lastPaidAt: string };
export type Upsell = { id: string; name: string; suggestion: string; price: number; status: string };

// GET /retention/overview
export type Retention = {
  atRisk: number; atRiskLeads: number; churnedThisMonth: number; retainedPct: number;
  previousPeriodActive: number; currentPeriodActive: number; retainedClients: number;
  atRiskClients: AtRiskClient[];
  upsell: Upsell[];
};
