import { useRouter } from "expo-router";

// Where a row of a dashboard list leads (route contract of the TZ packages). Routes of
// other packages are cast because typed routes do not know them until their files exist.
export function useKindNav() {
  const router = useRouter();
  const go = (pathname: string, params: Record<string, string>) => router.push({ pathname, params } as never);
  return {
    work: (workId: string) => router.push({ pathname: "/works/[id]", params: { id: workId } }),
    doc: (id: string) => go("/documents/[id]", { id }),
    order: (id: string) => go("/orders/[id]", { id }),
    payment: (id: string) => go("/payments/[id]", { id }),
    chat: (roomId: string) => go("/chat/[roomId]", { roomId }),
    list: (kind: string) => router.push({ pathname: "/dashboard-lists/[kind]", params: { kind } }),
  };
}
