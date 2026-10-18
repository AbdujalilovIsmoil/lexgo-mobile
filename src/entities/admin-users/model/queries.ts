import { useQuery } from "@tanstack/react-query";
import { listAdminUsers, searchUsers } from "../api/userApi";

// Search-as-you-type: fires from 2 characters.
export const useUserSearch = (q: string) => useQuery({ queryKey: ["admin-users", "search", q], queryFn: () => searchUsers(q), enabled: q.trim().length >= 2, staleTime: 30_000 });

export const useAdminUsers = (f: { role?: string; q?: string; status?: string } = {}) => useQuery({ queryKey: ["admin-users", "list", f], queryFn: () => listAdminUsers(f) });

// id → display name for the whole directory (so lists can show a person instead of a UUID); cached for a minute.
export const useUserNames = () =>
  useQuery({ queryKey: ["admin-users", "names"], queryFn: () => listAdminUsers({}), staleTime: 60_000, select: (l) => new Map(l.map((u) => [u.id, u.name || u.phone] as const)) });
