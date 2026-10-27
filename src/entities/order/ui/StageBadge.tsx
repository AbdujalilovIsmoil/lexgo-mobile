import type { FlowPhase } from "@/entities/market-flow";
import { Pill, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const WAIT: FlowPhase[] = ["received", "assigned", "advance", "pending", "cancelReview", "resolution", "replacing", "refund", "rework", "attention"];
const WORK: FlowPhase[] = ["paid", "reviewing", "in_progress"];
const toneOf = (p: FlowPhase): PillTone => (p === "cancelled" ? "err" : p === "completed" || p === "rated" ? "ok" : p === "refunded" ? "gray" : WAIT.includes(p) ? "warn" : "blue");

// Where the order stands ("Qabul qilindi / Ish jarayonida / Pul qaytarilmoqda …") as a coloured pill — the same words as the order's lead.
export function StageBadge({ phase }: { phase: FlowPhase }) {
  const { t } = useT();
  return <Pill label={t(`mf.phase.${phase}`)} tone={toneOf(phase)} small live={WORK.includes(phase) || phase === "rework"} />;
}
