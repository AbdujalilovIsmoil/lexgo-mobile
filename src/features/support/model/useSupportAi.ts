import { useCallback } from "react";
import { askSupportAi } from "@/entities/support";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useAiStore, type AiTurn } from "./aiStore";

// Ask the support AI first (TZ 10.1). Each question becomes a turn that is pending → done / failed.
export function useSupportAi() {
  const { t, locale } = useT();
  const role = useSession()?.user.backendRole ?? "client";
  const turns = useAiStore((s) => s.turns);
  const run = useCallback(
    async (id: number, q: string) => {
      const st = useAiStore.getState();
      const history = st.turns.filter((x) => x.state === "done").flatMap((x) => [{ role: "user" as const, content: x.q }, { role: "assistant" as const, content: x.a }]);
      try {
        st.done(id, await askSupportAi({ message: q, locale, role, sessionId: st.sessionId, history }));
      } catch {
        st.fail(id);
        toast(t("sp5.failed"), "err");
      }
    },
    [locale, role, t],
  );
  const ask = useCallback((question: string) => {
    const q = question.trim();
    if (q) void run(useAiStore.getState().add(q), q);
  }, [run]);
  const retry = useCallback((turn: AiTurn) => {
    useAiStore.getState().pend(turn.id);
    void run(turn.id, turn.q);
  }, [run]);
  return { turns, ask, retry, busy: turns.some((x) => x.state === "pending"), clear: useAiStore.getState().clear };
}
