import { heatOf, stepOf, type UrgentRequest } from "@/entities/urgent";
import { useNow } from "@/shared/lib/pay/useNow";
import { useColors } from "@/shared/theme";

// Live "time since the request" (NaN when unknown) and the colour of the record: red once the SLA is broken or it has waited long,
// amber while warm, blue when calm; green / grey once finished. The clock stops for a finished job.
export function useHeat(req: UrgentRequest): { ms: number; edge: string } {
  const c = useColors();
  const step = stepOf(req);
  const now = useNow(step >= 0 && step < 3, 30_000);
  const at = Date.parse(req.createdAt);
  const ms = Number.isNaN(at) ? NaN : Math.max(0, now - at);
  const h = heatOf(ms);
  const edge = step === 3 ? c.ok : step < 0 ? c.gray : req.slaBreached || h === "hot" ? c.err : h === "warm" ? c.warn : c.accent;
  return { ms, edge };
}
