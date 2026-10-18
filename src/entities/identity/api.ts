import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";

export type IdentityProvider = "oneid" | "myid";
export type IdentityStatus = { verified: boolean; provider: string; status: string; fullName: string; pinfl: string };
export type IdentityStart = { mode: "redirect" | "code"; authUrl: string; state: string };

const PENDING = /^(pending|started|in_progress|processing)$/;
export const isIdentityPending = (s?: IdentityStatus | null): boolean => !!s && !s.verified && PENDING.test(s.status);

function norm(v: unknown): IdentityStatus {
  const d = asDict(v);
  const status = asStr(d.status).trim().toLowerCase();
  return {
    verified: Boolean(d.verified ?? d.identity_verified) || /^(verified|approved|success)$/.test(status),
    provider: asStr(d.provider ?? d.identity_provider), status,
    fullName: asStr(d.full_name ?? d.name), pinfl: asStr(d.pinfl ?? d.pnfl),
  };
}

// GET /identity/me — a list of verifications: a verified one wins, then an in-progress one.
export async function getIdentity(): Promise<IdentityStatus> {
  const raw = await http("/identity/me");
  const w = asDict(raw);
  const arr = Array.isArray(raw) ? raw : asArr(w.items ?? w.data);
  if (!arr.length) return norm(Array.isArray(raw) ? {} : raw);
  const all = arr.map(norm);
  return all.find((x) => x.verified) ?? all.find(isIdentityPending) ?? all[0];
}

// POST /identity/start — a provider page to open ("redirect") or a state for code entry ("code").
export async function identityStart(provider: IdentityProvider, redirectUri: string): Promise<IdentityStart> {
  const d = asDict(await http("/identity/start", { method: "POST", body: { provider, redirect_uri: redirectUri, purpose: "profile_verification" } }));
  const authUrl = safeHttpsUrl(d.auth_url ?? d.authUrl ?? d.redirect_url ?? d.authorization_url ?? d.url);
  const demo = d.demo_code != null || d.demoCode != null || /demo/i.test(asStr(d.mode ?? d.provider_mode));
  return { mode: authUrl && !demo ? "redirect" : "code", authUrl, state: asStr(d.state ?? d.verification_id ?? d.id) };
}

// POST /identity/verify-demo — the typed code (never read from the response).
export async function identityVerifyDemo(provider: IdentityProvider, state: string, code: string): Promise<IdentityStatus> {
  return norm(await http("/identity/verify-demo", { method: "POST", body: { provider, state, code } }));
}
