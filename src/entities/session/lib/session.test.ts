import { ApiError } from "@/shared/api";
import { accountGate, isSellerUser, mergeUser } from "./accountState";
import { describeAuthError } from "./authError";
import { isRevoked, makeRefresher, type RefreshDeps } from "./refreshPolicy";
import { isCodeExpired, retryAfterOf } from "./retryAfter";
import type { Session, User } from "../model/types";

const err = (status: number, detail?: string, extra?: ConstructorParameters<typeof ApiError>[2]) => new ApiError(status, detail, extra);

describe("retryAfterOf", () => {
  it("prefers the explicit seconds, caps at a day", () => {
    expect(retryAfterOf(err(429, "x", { retryAfter: 30 }))).toBe(30);
    expect(retryAfterOf(err(429, "x", { retryAfter: 999999 }))).toBe(86400);
    expect(retryAfterOf(err(429, "x", { data: { detail: { retry_after: 12.2 } } }))).toBe(13);
  });
  it("reads blocked_until and the wording", () => {
    const now = Date.parse("2026-10-18T10:00:00Z");
    expect(retryAfterOf(err(429, "x", { data: { detail: { blocked_until: "2026-10-18T10:15:00Z" } } }), now)).toBe(900);
    expect(retryAfterOf(err(429, "x", { data: { detail: { blocked_until: "2026-10-18T09:00:00Z" } } }), now)).toBe(0);
    expect(retryAfterOf(err(429, "15 daqiqadan keyin urinib ko'ring"))).toBe(900);
    expect(retryAfterOf(err(429, "Подождите 40 сек"))).toBe(40);
  });
  it("is 0 for non-API errors and hintless ones", () => {
    expect(retryAfterOf(new Error("x"))).toBe(0);
    expect(retryAfterOf(err(500, "boom"))).toBe(0);
  });
});

describe("isCodeExpired", () => {
  it("410 and expiry wording, but not a wrong code", () => {
    expect(isCodeExpired(err(410))).toBe(true);
    expect(isCodeExpired(err(400, "Kod muddati o'tgan"))).toBe(true);
    expect(isCodeExpired(err(400, "Код истёк"))).toBe(true);
    expect(isCodeExpired(err(400, "Kod noto'g'ri yoki muddati o'tgan"))).toBe(false);
    expect(isCodeExpired(err(400, "invalid code"))).toBe(false);
    expect(isCodeExpired(new Error("expired"))).toBe(false);
  });
});

describe("describeAuthError", () => {
  it("maps statuses to what the screens branch on", () => {
    expect(describeAuthError(err(0, "network_error"))).toMatchObject({ kind: "offline", message: "" });
    expect(describeAuthError(err(429, "wait", { retryAfter: 30 })).kind).toBe("rate");
    expect(describeAuthError(err(429, "wait", { retryAfter: 900 })).kind).toBe("blocked");
    expect(describeAuthError(err(429, "3 marta xato, blocked")).kind).toBe("blocked");
    expect(describeAuthError(err(409)).kind).toBe("exists");
    expect(describeAuthError(err(503)).kind).toBe("channel");
    expect(describeAuthError(err(500)).kind).toBe("server");
    expect(describeAuthError(err(422, "bad", { fieldErrors: { phone: "bad" } }))).toMatchObject({ kind: "validation", fields: { phone: "bad" } });
    expect(describeAuthError(err(403)).kind).toBe("forbidden");
    expect(describeAuthError(err(401, "Parol noto'g'ri")).kind).toBe("wrong");
    expect(describeAuthError(err(400, "Kod muddati o'tgan")).kind).toBe("expired");
    expect(describeAuthError(err(418)).kind).toBe("other");
    expect(describeAuthError("boom")).toMatchObject({ kind: "server", status: -1 });
  });
});

describe("accountGate", () => {
  it("ok / pending / blocked / deleted / rejected / restricted", () => {
    for (const s of [undefined, "", "active", "Approved", "verified"]) expect(accountGate(s)).toBe("ok");
    expect(accountGate("pending_review")).toBe("pending");
    expect(accountGate("under_review")).toBe("pending");
    expect(accountGate("blocked")).toBe("blocked");
    expect(accountGate("suspended")).toBe("blocked");
    expect(accountGate("deleted")).toBe("deleted");
    expect(accountGate("rejected")).toBe("rejected");
    expect(accountGate("weird")).toBe("restricted");
  });
  it("sellers and merging a partial user", () => {
    expect(isSellerUser({ backendRole: "advokat", roles: [] } as never)).toBe(true);
    expect(isSellerUser({ backendRole: "client", roles: ["yurist"] } as never)).toBe(true);
    expect(isSellerUser({ backendRole: "client", roles: [] } as never)).toBe(false);
    expect(mergeUser({ id: "1", name: "Ali", phone: "+998" } as User, { id: "1", name: undefined, phone: "+999" } as unknown as User)).toMatchObject({ name: "Ali", phone: "+999" });
  });
});

describe("makeRefresher", () => {
  const sess = (token: string, refreshToken: string, id = "u1"): Session => ({ token, refreshToken, user: { id } } as unknown as Session);
  const LONG = "r".repeat(64);
  const mk = (cur: Session | null, refresh: RefreshDeps["refresh"]) => {
    const state = { cur };
    const deps: RefreshDeps & { saved: string[]; expired: number } = { saved: [], expired: 0, current: () => state.cur, refresh, save: async (t) => { deps.saved.push(t); }, expire: async () => { deps.expired++; state.cur = null; } };
    return { deps, state, run: makeRefresher(deps) };
  };
  it("isRevoked is only 400/401/403", () => {
    expect([400, 401, 403].map((s) => isRevoked(err(s)))).toEqual([true, true, true]);
    expect([0, 429, 500].map((s) => isRevoked(err(s)))).toEqual([false, false, false]);
  });
  it("renews and saves the new pair", async () => {
    const { deps, run } = mk(sess("old", LONG), async () => ({ token: "new", refreshToken: "n".repeat(64) }));
    expect(await run()).toBe("new");
    expect(deps.saved).toEqual(["new"]);
  });
  it("a short refresh token can never be renewed: sign out", async () => {
    const { deps, run } = mk(sess("old", "short"), async () => ({ token: "x", refreshToken: "y" }));
    expect(await run()).toBeNull();
    expect(deps.expired).toBe(1);
  });
  it("signs out only when the server revoked it, not on network / 5xx / 429", async () => {
    for (const status of [0, 429, 500]) {
      const { deps, run } = mk(sess("old", LONG), async () => { throw err(status); });
      expect(await run()).toBeNull();
      expect(deps.expired).toBe(0);
    }
    const revoked = mk(sess("old", LONG), async () => { throw err(401); });
    expect(await revoked.run()).toBeNull();
    expect(revoked.deps.expired).toBe(1);
  });
  it("does not hand a token to another account after a user switch", async () => {
    const { run, state } = mk(sess("old", LONG, "u1"), async () => { state.cur = sess("other", "z".repeat(64), "u2"); return { token: "new", refreshToken: "n".repeat(64) }; });
    expect(await run()).toBeNull();
  });
  it("uses a concurrent rotation of the same account instead of overwriting it", async () => {
    const { deps, run, state } = mk(sess("old", LONG), async () => { state.cur = sess("rotated", "q".repeat(64)); return { token: "new", refreshToken: "n".repeat(64) }; });
    expect(await run()).toBe("rotated");
    expect(deps.saved).toEqual([]);
  });
  it("nothing to refresh when signed out", async () => {
    expect(await mk(null, async () => ({ token: "x", refreshToken: "y" })).run()).toBeNull();
  });
});
