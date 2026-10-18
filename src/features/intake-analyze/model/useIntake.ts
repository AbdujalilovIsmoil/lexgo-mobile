import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { classifyProblem, URGENT_LEVELS, type Classification } from "@/entities/intake";
import { getMyMatches, useMyMatches, type MyMatch } from "@/entities/lawyer";
import { useAppForm } from "@/shared/form";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { intakeSchema } from "./intakeSchema";

// "Muammo tahlili": POST /ai/classify creates a lead, then GET /matching/me lists the advocates
// matched to it. Before the first analysis the same endpoint gives the earlier picks (`prev`).
// A failed classification offers the SOS fallback.
export function useIntake() {
  const qc = useQueryClient();
  const prevQ = useMyMatches(true);
  const prev = prevQ.data ?? [];
  const form = useAppForm(intakeSchema, { text: "" });
  const text = form.watch("text");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [matches, setMatches] = useState<MyMatch[]>([]);
  const [matchesBusy, setMatchesBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const analyze = form.handleSubmit(async (v) => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    setResult(null);
    setMatches([]);
    try {
      setResult(await classifyProblem(v.text));
      successHaptic();
      setMatchesBusy(true);
      qc.fetchQuery({ queryKey: ["my-matches"], queryFn: getMyMatches, staleTime: 0 })
        .then(setMatches)
        .catch(() => setMatches([]))
        .finally(() => setMatchesBusy(false));
    } catch {
      errorHaptic();
      setFailed(true);
    } finally {
      setBusy(false);
    }
  });

  const urgent = !!result && URGENT_LEVELS.has(result.urgency);
  return { text, control: form.control, busy, result, matches, matchesBusy, prev, prevLoading: prevQ.isPending, failed, urgent, analyze };
}
