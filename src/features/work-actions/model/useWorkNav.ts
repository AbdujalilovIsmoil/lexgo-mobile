import { useRouter } from "expo-router";
import type { WorkDetail } from "@/entities/work";

// Screens of the work's own module (route contract of the TZ packages).
const MODULE: Record<string, string> = { document: "/documents/[id]", urgent: "/urgent/[id]", order: "/orders/[id]", case: "/cases", complaint: "/complaints" };

// Hand-offs to screens other packages own: chat, call room, rating, payments, and the
// module screen of the work. Paths follow the shared route contract.
export function useWorkNav() {
  const router = useRouter();
  const go = (pathname: string, params?: Record<string, string>) => router.push({ pathname, params } as never);
  return {
    chat: (roomId: string) => go("/chat/[roomId]", { roomId }),
    call: (roomId: string, callId: string) => go("/call/[roomId]", { roomId, callId }),
    rate: (workId: string) => go("/rate/[workId]", { workId }),
    payments: () => go("/payments"),
    canOpen: (r: WorkDetail["related"]) => !!r && !!r.id && !!MODULE[r.kind],
    open: (r: NonNullable<WorkDetail["related"]>) => go(MODULE[r.kind], { id: r.id }),
  };
}
