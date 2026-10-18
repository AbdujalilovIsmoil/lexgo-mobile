import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listOpenCases } from "./api";

const DONE = new Set(["completed", "archived"]);

// The dashboard panel is "Faol so'rovlaringiz": closed and archived cases stay out of it.
export function useOpenCases() {
  const authed = useIsAuthed();
  const q = useQuery({ queryKey: ["client-cases"], queryFn: listOpenCases, enabled: authed, staleTime: 30 * 1000 });
  return { ...q, open: (q.data ?? []).filter((c) => !DONE.has(c.status)) };
}
