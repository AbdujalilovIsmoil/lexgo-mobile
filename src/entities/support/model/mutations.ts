import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { createTicket, reopenTicket } from "../api/ticketApi";
import { supKeys } from "./keys";
import type { NewTicketInput } from "./types";

// Callers show the server's message themselves (the contact-blocked note is inline).
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTicketInput) => createTicket(input),
    onSuccess: () => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: supKeys.all });
    },
    onError: errorHaptic,
  });
}

export function useReopenTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => reopenTicket(id, reason),
    onSuccess: () => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: supKeys.all });
    },
    onError: errorHaptic,
  });
}
