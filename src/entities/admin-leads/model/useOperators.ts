import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { listCcOperators, listOperators } from "../api/peopleApi";
import type { Operator, OpsStatus } from "./types";
import { leadKeys } from "./queries";

const NONE: Operator[] = [];
export type OpsSource = "admin" | "cc" | "";

// Operators leads can be assigned to. "admin" reads GET /admin/users (users.manage); "cc" reads the call-center
// operator directory (what an operator account can see); "" or a 403 → "forbidden" and the assign controls stay hidden.
export function useOperators(source: OpsSource): { ops: Operator[]; status: OpsStatus } {
  const q = useQuery({ queryKey: [...leadKeys.all, "operators", source], queryFn: source === "cc" ? listCcOperators : listOperators, enabled: source !== "", staleTime: 5 * 60_000, retry: false });
  if (source === "" || (q.error instanceof ApiError && q.error.status === 403)) return { ops: NONE, status: "forbidden" };
  if (q.isError) return { ops: NONE, status: "error" };
  return q.data ? { ops: q.data, status: "ready" } : { ops: NONE, status: "loading" };
}
