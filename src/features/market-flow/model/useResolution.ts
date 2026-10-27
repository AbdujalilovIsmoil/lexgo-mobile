import { useRef } from "react";
import { randomUUID } from "expo-crypto";
import { chooseResolution, type ResolutionAnswer, type ResolutionChoice } from "@/entities/market-flow";
import { ApiError } from "@/shared/api";
import { useFlowMutation } from "./useFlowMutation";

type V = { choice: ResolutionChoice; reason: string };

// The client's answer to the call center's offer ("Alternative specialist or full refund" §1.4–1.7). One Idempotency-Key per decision:
// while the answer is unknown (no connection, a timeout) the key is kept, so tapping again repeats the same request and the backend
// answers it as a replay; once the backend answered either way the key is dropped.
export function useResolution(orderId: string, onDone: (a: ResolutionAnswer, v: V) => void) {
  const key = useRef<{ choice: ResolutionChoice; value: string } | null>(null);
  return useFlowMutation<V, ResolutionAnswer>({
    mutationFn: (v) => {
      if (key.current?.choice !== v.choice) key.current = { choice: v.choice, value: randomUUID() };
      return chooseResolution(orderId, v, key.current.value);
    },
    onSuccess: (a, v) => {
      key.current = null;
      onDone(a, v);
    },
    onError: (e) => {
      if (!(e instanceof ApiError && e.status === 0)) key.current = null;
      return false;
    },
  });
}
