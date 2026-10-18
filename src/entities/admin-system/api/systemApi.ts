import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { AiStatus, Readiness } from "../model/types";

const text = (v: unknown) => (typeof v === "boolean" ? (v ? "✓" : "✗") : asStr(v));

export async function getReadiness(): Promise<Readiness> {
  const d = asDict(await http("/admin/e2e/readiness"));
  return {
    status: asStr(d.status), checkedAt: asStr(d.checked_at),
    fixtures: Object.entries(asDict(d.fixtures)).map(([key, v]) => ({ key, value: asNum(v) })),
    scenarios: asArr(d.scenarios).map((s) => {
      const x = asDict(s);
      return {
        key: asStr(x.key), status: asStr(x.status),
        checks: Object.entries(asDict(x.checks)).map(([key, v]) => ({ key, value: text(v), ok: v !== false })),
        routes: asArr(x.routes).map((r) => asStr(r)),
      };
    }),
  };
}

// Health (provider / model) and capabilities (tools, permissions) of the AI assistant, read together.
export async function getAiStatus(): Promise<AiStatus> {
  const [h, c] = await Promise.all([http("/api/ai/health"), http("/api/ai/capabilities")]);
  const health = asDict(h);
  const cap = asDict(c);
  return {
    status: asStr(health.status), provider: asStr(health.provider), model: asStr(health.model), configured: health.configured === true, pages: asNum(health.registry_pages),
    tools: asArr(cap.tools).map((t) => { const x = asDict(t); return { name: asStr(x.name), risk: asStr(x.risk), description: asStr(x.description) }; }),
    permissions: asArr(cap.permissions).length,
  };
}
