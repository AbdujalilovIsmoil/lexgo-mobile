import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";

type Params = Record<string, string | number | boolean | undefined>;

export function qs(p: Params = {}): string {
  const parts = Object.entries(p).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

// Every HRM endpoint lives under /internal. The list endpoints return the whole result as a plain array.
export const hrmGet = (path: string, p?: Params) => http<unknown>(`/internal${path}${qs(p)}`);
export const hrmList = async (path: string, p?: Params): Promise<unknown[]> => listFrom(await hrmGet(path, p), "items", "data");
export const hrmPost = (path: string, body: unknown) => http<unknown>(`/internal${path}`, { method: "POST", body });
export const hrmPatch = (path: string, body: unknown) => http<unknown>(`/internal${path}`, { method: "PATCH", body });
export const hrmPath = (path: string, p?: Params) => `/internal${path}${qs(p)}`;
