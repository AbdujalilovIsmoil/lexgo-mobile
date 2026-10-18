type Val = string | number | boolean | undefined | null;

// Query string without URLSearchParams: empty values are skipped.
export function qs(o: Record<string, Val>): string {
  const parts = Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export const enc = encodeURIComponent;
