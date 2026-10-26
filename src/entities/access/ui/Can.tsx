import type { ReactNode } from "react";
import { useAccess } from "../model/useAccess";

// Renders its children only when the user holds the permission (one code, or any of a list).
export function Can({ perm, children, fallback = null }: { perm: string | readonly string[]; children: ReactNode; fallback?: ReactNode }) {
  return <>{useAccess().can(perm) ? children : fallback}</>;
}
