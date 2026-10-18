// The chat response names its sibling endpoints (event_url, runtime_url, actions_*_url). They are
// honoured only inside /ai/instructor/ — a malicious or odd value falls back to the documented path.
export type Endpoints = { events: string; runtime: string; preview: string; confirm: string };

export const DEFAULT_ENDPOINTS: Endpoints = {
  events: "/ai/instructor/events",
  runtime: "/ai/instructor/runtime",
  preview: "/ai/instructor/actions/preview",
  confirm: "/ai/instructor/actions/confirm",
};

const OK = /^\/ai\/instructor\/[A-Za-z0-9_\-/]*$/;
let current: Endpoints = DEFAULT_ENDPOINTS;

const safe = (v: unknown, fallback: string): string => {
  const s = typeof v === "string" ? v.trim().split(/[?#]/)[0] : "";
  return OK.test(s) && !s.includes("..") && !s.includes("//") ? s : fallback;
};

export function adoptEndpoints(raw: Record<string, unknown>): void {
  current = {
    events: safe(raw.event_url ?? raw.events_url, DEFAULT_ENDPOINTS.events),
    runtime: safe(raw.runtime_url, DEFAULT_ENDPOINTS.runtime),
    preview: safe(raw.actions_preview_url ?? raw.preview_url, DEFAULT_ENDPOINTS.preview),
    confirm: safe(raw.actions_confirm_url ?? raw.confirm_url, DEFAULT_ENDPOINTS.confirm),
  };
}

export const endpoints = (): Endpoints => current;
