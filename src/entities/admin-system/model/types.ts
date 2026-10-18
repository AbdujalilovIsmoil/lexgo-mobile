export type Scenario = { key: string; status: string; checks: { key: string; value: string; ok: boolean }[]; routes: string[] };
// GET /admin/e2e/readiness — which end-to-end flows the platform can run right now.
export type Readiness = { status: string; checkedAt: string; fixtures: { key: string; value: number }[]; scenarios: Scenario[] };

export type AiTool = { name: string; risk: string; description: string };
// GET /api/ai/health + /api/ai/capabilities — the AI assistant's provider, model and the tools it may call.
export type AiStatus = { status: string; provider: string; model: string; configured: boolean; pages: number; tools: AiTool[]; permissions: number };
