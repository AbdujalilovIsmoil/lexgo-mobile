import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createClient, listClients, patchClient } from "../api/clientApi";
import { makeDocument } from "../api/docApi";
import type { B2bClient } from "./types";

export const b2bKeys = { all: ["admin-b2b"] as const, clients: ["admin-b2b", "clients"] as const };

export const useClients = () => useQuery({ queryKey: b2bKeys.clients, queryFn: listClients });

export const useAddClient = () => useAdminMutation({ mutationFn: createClient, invalidate: [b2bKeys.clients], success: "admB2b.created" });

// Stage change: the pill switches at once, a rejected save puts it back.
export function useSetStage() {
  const qc = useQueryClient();
  return useAdminMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const snap = qc.getQueryData<B2bClient[]>(b2bKeys.clients);
      qc.setQueryData<B2bClient[]>(b2bKeys.clients, (cur) => cur?.map((c) => (c.id === id ? { ...c, stage } : c)));
      try {
        await patchClient(id, { stage });
      } catch (e) {
        qc.setQueryData(b2bKeys.clients, snap);
        throw e;
      }
    },
    invalidate: [b2bKeys.clients],
  });
}

export const useMakeDocument = () => useAdminMutation({ mutationFn: makeDocument });
