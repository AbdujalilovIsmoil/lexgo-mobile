const DAY = 86_400_000; // not imported from kv: this file stays free of the SQLite module (pure, unit-testable)

// Which react-query snapshots may be kept on the device (TZ 38). Everything not listed stays in
// memory only. Packages opt in at module scope: persistQueries(["secure-chat", "rooms"], { ttlMs }).
export type PersistRule = { prefix: readonly unknown[]; ttlMs: number; firstPageOnly: boolean };
const rules: PersistRule[] = [];

export function persistQueries(prefix: readonly unknown[], opts: { ttlMs?: number; firstPageOnly?: boolean } = {}): void {
  const i = rules.findIndex((r) => JSON.stringify(r.prefix) === JSON.stringify(prefix));
  const rule = { prefix, ttlMs: opts.ttlMs ?? 3 * DAY, firstPageOnly: opts.firstPageOnly ?? true };
  if (i >= 0) rules[i] = rule;
  else rules.push(rule);
}

// Deny list: wins over every allow rule, whatever a package registers. Anything that carries credentials, payment
// data, security settings, chat contents or live-call state is never written to the device (TZ 38).
const DENY_ROOT = /^(auth|admin-otp|security|sec|pay|payments?|identity|call|ai|sos|location|session|demo)(-|$)/i;
// editor: a document-server session (signed config + token); sources / versions: signed download links; payouts: bank data.
const DENY_SEGMENT = /^(chat|chats|room|rooms-msgs|messages|msgs|otp|totp|token|secret|password|card|cards|requisites|2fa|keys?|editor|sources|payouts|versions)$/i;
const SECURE_CHAT_ALLOWED = (key: readonly unknown[]): boolean => key[0] === "secure-chat" && key[1] === "rooms";

export function isDenied(key: readonly unknown[]): boolean {
  const root = String(key[0] ?? "");
  if (key[0] === "secure-chat") return !SECURE_CHAT_ALLOWED(key);
  if (DENY_ROOT.test(root)) return true;
  return key.slice(1).some((p) => typeof p === "string" && DENY_SEGMENT.test(p));
}

export function ruleFor(key: readonly unknown[]): PersistRule | null {
  if (isDenied(key)) return null;
  return rules.find((r) => r.prefix.every((p, i) => key[i] === p)) ?? null;
}

/** Longest TTL of any rule: in-memory gcTime of persisted queries must be at least this, or they vanish before reuse. */
export const rulePrefixes = (): readonly (readonly unknown[])[] => rules.map((r) => r.prefix);

// Defaults: notification list + preferences, entitlements, chat list with its last message. The public catalogue (plans, service
// categories and lists) is kept for everybody, guests too, by the app's AsyncStorage copy (core/providers/queryPersist), not twice.
persistQueries(["notifications"], { ttlMs: 3 * DAY });
persistQueries(["notification-prefs"], { ttlMs: 7 * DAY });
persistQueries(["entitlements"], { ttlMs: DAY });
persistQueries(["secure-chat", "rooms"], { ttlMs: 3 * DAY });

// Signed-in work data: lists and detail metadata that make the app usable without a connection.
// Chat/room contents, payment profiles, identity and security are covered by the deny list above.
persistQueries(["pro-tasks"], { ttlMs: 7 * DAY });
persistQueries(["pro-calendar"], { ttlMs: 7 * DAY });
persistQueries(["pro-cases"], { ttlMs: 7 * DAY });
persistQueries(["pro-clients"], { ttlMs: 7 * DAY });
persistQueries(["pro-service"], { ttlMs: 7 * DAY });
persistQueries(["pro-availability"], { ttlMs: 7 * DAY });
persistQueries(["client-cases"], { ttlMs: 7 * DAY });
persistQueries(["my-docs"], { ttlMs: 7 * DAY });
persistQueries(["orders"], { ttlMs: 3 * DAY });
persistQueries(["market-orders"], { ttlMs: 3 * DAY });
persistQueries(["business-hours"], { ttlMs: 7 * DAY });
persistQueries(["offered-service-ids"], { ttlMs: 7 * DAY });
persistQueries(["client-stats"], { ttlMs: DAY });
// The professional's home (cabinet, stats), incoming requests, the file tree, document requests (list, card, pool) and
// the client's works: the screens a lawyer / advocate / client opens first, so they still open without a connection.
persistQueries(["pro-workspace"], { ttlMs: 3 * DAY });
persistQueries(["pro-requests"], { ttlMs: 3 * DAY });
persistQueries(["pro-files"], { ttlMs: 7 * DAY });
persistQueries(["pro-docs", "list"], { ttlMs: 3 * DAY });
persistQueries(["pro-docs", "one"], { ttlMs: 3 * DAY });
persistQueries(["pro-docs", "pool"], { ttlMs: DAY });
persistQueries(["works"], { ttlMs: 7 * DAY });
