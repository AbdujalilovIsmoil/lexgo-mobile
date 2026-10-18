export type RuleScope = "global" | "service" | "category" | "";

export type ServiceRule = {
  id: string;
  key: string;
  title: string;
  version: string;
  body: string;
  scope: RuleScope;
  scopeId: string;
  effectiveAt: string; // ISO date or ""
  accepted: boolean;
  acceptedAt: string; // ISO date or ""
};

export type RulesState = { items: ServiceRule[]; allAccepted: boolean; count: number };

export type AcceptResult = { ruleId: string; accepted: boolean; acceptedAt: string; allAccepted: boolean | null };
