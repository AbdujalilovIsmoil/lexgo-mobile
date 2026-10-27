// Pure types of the deep-link resolver. No React / Expo imports here: the resolver is plain TS so
// its table-driven checks (checks/*.check.ts) run under node.
export type Dict = Record<string, unknown>;

// What a notification, push payload, `deep_link` string or link carries (TZ 28).
export type LinkInput = { event?: string; category?: string; entityType?: string; entityId?: string; deepLink?: string; data?: Dict };

// The app's roles: a client (also a visitor, `signedIn` false) and a professional (advokat / yurist).
export type ViewerKind = "client" | "seller";
export type Viewer = { signedIn: boolean; kind: ViewerKind };

export type SubjectKind =
  | "chat" | "call" | "doc" | "order" | "payment" | "ticket" | "urgent" | "complaint" | "subscription" | "calendar"
  | "promotion" | "gift" | "referral" | "security" | "registration" | "case" | "experience" | "achievement" | "service";
export type Subject = { kind: SubjectKind; id: string; event: string; data: Dict };

// GET `path` before opening: 2xx (and a body.status outside `closed`) = open, 403/404/410 = closed.
export type Probe = { path: string; closed?: string[] };
// `href` is where the link leads, `fallback` the safe list used when the resource is closed or the
// viewer may not see it, `label` the i18n key of the button ("Hujjatni ochish").
export type Target = { href: string; fallback: string; label: string; probe?: Probe };

export type Resolution = { kind: "target"; target: Target } | { kind: "blocked"; fallback: string } | { kind: "none" };

export const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
export const dict = (v: unknown): Dict => (v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : {});
export const enc = (v: string): string => encodeURIComponent(v);
