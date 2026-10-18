import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { enc } from "../lib/qs";
import type { StudioCheck } from "../model/typesCheck";
import type { StudioPayload } from "../model/types";

const strs = (v: unknown) => asArr(v).map((x) => asStr(x)).filter(Boolean);

// The request body IS the payload (not wrapped); the answer carries `errors`, `impact` and, for preview, a `diff`.
export async function checkPayload(code: string, payload: StudioPayload): Promise<StudioCheck> {
  const [v, p] = await Promise.all([
    http(`/studio/constructors/${enc(code)}/validate`, { method: "POST", body: payload }),
    http(`/studio/constructors/${enc(code)}/preview`, { method: "POST", body: payload }),
  ]);
  const d = asDict(v);
  const impact = asDict(d.impact);
  return {
    ok: d.ok === true,
    errors: asArr(d.errors).map((e) => ({ field: asStr(asDict(e).field), code: asStr(asDict(e).code), message: asStr(asDict(e).message) })),
    target: asStr(impact.runtime_target), operation: asStr(impact.operation), requiresApproval: impact.requires_approval === true, warnings: strs(impact.warnings),
    changed: strs(asDict(asDict(p).diff).changed_fields),
  };
}
