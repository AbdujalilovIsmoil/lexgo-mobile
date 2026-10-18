// PII scrubber (TZ 41): analytics carries identifiers of the *kind* of thing (screen name, status,
// bucket), never the thing. Only listed keys pass, and a value must look like a short token: no
// spaces, no digits-only runs, no e-mail, URL, UUID or JWT shape. Everything else is dropped.
export const ALLOWED_PROPS: ReadonlySet<string> = new Set([
  "screen", "action", "step", "flow", "result", "reason", "status", "kind", "event", "source", "target", "role",
  "bucket", "latency", "size", "quality", "attempt", "count", "online", "platform", "channel", "category", "ok", "ms",
]);

const TOKEN = /^[A-Za-z0-9_.:/\-[\]()]{1,48}$/;
const NOT_TOKEN = [/^\d{6,}$/, /@/, /^[0-9a-f]{8}-[0-9a-f]{4}-/i, /^eyJ/, /^\+?\d[\d\s-]{7,}$/, /:\/\//, /^(data|file|content|blob):/i];
type Prim = string | number | boolean;

function clean(v: unknown): Prim | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v * 100) / 100 : undefined;
  if (typeof v !== "string" || !TOKEN.test(v)) return undefined;
  return NOT_TOKEN.some((re) => re.test(v)) ? undefined : v;
}

export function scrubProps(props: Record<string, unknown> | undefined): Record<string, Prim> {
  const out: Record<string, Prim> = {};
  if (!props) return out;
  for (const [k, v] of Object.entries(props)) {
    const c = ALLOWED_PROPS.has(k) ? clean(v) : undefined;
    if (c !== undefined) out[k] = c;
  }
  return out;
}
