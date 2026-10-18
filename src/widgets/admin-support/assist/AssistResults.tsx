import type { AssistContext, AssistSent } from "@/entities/admin-support";
import { DocResultCard } from "./DocResultCard";
import { MarketResultCard } from "./MarketResultCard";
import { PlanResultCard } from "./PlanResultCard";
import { UrgentResultCard } from "./UrgentResultCard";

type Props = { sent: AssistSent[]; ctx: AssistContext; ctxAt: number; onDismiss: (key: string) => void };

// The result cards of everything this operator sent on the client's behalf in this session.
export function AssistResults({ sent, ctx, ctxAt, onDismiss }: Props) {
  return (
    <>
      {sent.map((s) => {
        const dismiss = () => onDismiss(s.key);
        if (s.kind === "plan") return <PlanResultCard key={s.key} s={s} ctx={ctx} ctxAt={ctxAt} onDismiss={dismiss} />;
        if (s.kind === "doc") return <DocResultCard key={s.key} s={s} ctx={ctx} onDismiss={dismiss} />;
        if (s.kind === "market") return <MarketResultCard key={s.key} s={s} ctx={ctx} onDismiss={dismiss} />;
        return <UrgentResultCard key={s.key} s={s} onDismiss={dismiss} />;
      })}
    </>
  );
}
