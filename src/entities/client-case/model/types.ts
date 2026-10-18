// "Mening ishlarim" on the web (portal/client/cases): legal cases joined with the orders behind them.
export type ClientCase = {
  id: string;
  caseNumber: string;
  caseType: string;
  title: string;
  stage: string;
  status: string;
  nextAction: string;
  orderId: string;
};

export type CaseOrder = {
  id: string;
  workId: string;
  title: string;
  serviceName: string;
  status: string;
  createdAt: string;
};

// A case (with its order, when linked) or an order that has no case yet.
export type CaseItem = { key: string; case?: ClientCase; order?: CaseOrder };

export type CaseDoc = { id: string; title: string; status: string };
export type ReplacementEvent = { id: string; status: string; createdAt: string };
export type StatusEntry = { status: string; note: string; at: string };

export type Milestone = {
  id: string;
  index: number;
  title: string;
  percent: number;
  amount: number;
  status: string;
};

export type BusinessHours = { days: number[]; start: string; end: string; holidays: string[] };
