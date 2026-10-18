export type B2bClient = { id: string; name: string; industry: string; contact: string; stage: string; value: number };
// New client: the first four go to POST /b2b/clients, the rest to a PATCH right after.
export type ClientDraft = { name: string; inn: string; director: string; industry: string; contact: string; monthly: string; sla: string };
export type DocKind = "invoice" | "contract" | "report";
export type DocRequest = { kind: DocKind; client: B2bClient; amount: number; description: string; month: string };
// A generated PDF: where to fetch it plus the numbers the backend printed on it.
export type B2bDocument = { id: string; fileUrl: string; total: number; vatAmount: number; vatPercent: number; taskCount?: number; period: string };
