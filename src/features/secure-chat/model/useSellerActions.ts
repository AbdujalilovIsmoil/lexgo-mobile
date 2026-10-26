import { useAccess } from "@/entities/access";
import { useCabinetSlice, type Cabinet } from "@/entities/pro-workspace";

type Actions = { chat: boolean; calls: boolean };

// The cabinet's available_actions.{secure_chat, calls} (GET /lawyers/me/cabinet, read once for the app): a professional whose
// verification is still pending gets limited_access and neither chat nor calls (permission-first, TZ 3.2). Everybody who is not a
// professional is never limited here.
const actionsOf = (c: Cabinet): Actions => ({ chat: c.actions.secureChat, calls: c.actions.calls });

export function useSellerActions(): Actions & { loading: boolean } {
  const seller = useAccess().seller;
  const q = useCabinetSlice(actionsOf);
  return { chat: !seller || (q.data?.chat ?? true), calls: !seller || (q.data?.calls ?? true), loading: seller && q.isLoading };
}
