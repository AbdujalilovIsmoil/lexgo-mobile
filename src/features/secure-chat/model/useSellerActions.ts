import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { useAccess } from "@/entities/access";

type Actions = { chat: boolean; calls: boolean };

// GET /lawyers/me/cabinet -> available_actions.{secure_chat, calls}: a professional whose verification is still pending
// gets limited_access and neither chat nor calls (permission-first, TZ 3.2). An action the backend does not list
// follows the overall access level. Everybody who is not a professional is never limited here.
async function fetchActions(): Promise<Actions> {
  const d = asDict(await http("/lawyers/me/cabinet"));
  const a = asDict(d.available_actions);
  const open = d.limited_access !== true;
  const allowed = (k: string) => (a[k] == null ? open : Boolean(a[k]));
  return { chat: allowed("secure_chat"), calls: allowed("calls") };
}

export function useSellerActions(): Actions & { loading: boolean } {
  const seller = useAccess().seller;
  const q = useQuery({ queryKey: ["secure-chat", "cabinet"], queryFn: fetchActions, enabled: seller, staleTime: 120_000, retry: false });
  return { chat: !seller || (q.data?.chat ?? true), calls: !seller || (q.data?.calls ?? true), loading: seller && q.isLoading };
}
