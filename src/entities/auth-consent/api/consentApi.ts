import { http, ApiError } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { ConsentDetail, ConsentDoc } from "../model/types";

// Title / body come in several languages ({uz, ru, uz_cyrl}); the UI language wins, Uzbek is the fallback.
const pick = (m: unknown, plain: unknown, locale: string): string => {
  const d = asDict(m);
  return asStr(d[locale] ?? d.uz ?? plain);
};

function norm(v: unknown, locale: string): ConsentDetail | null {
  const d = asDict(v);
  const id = asStr(d.id);
  if (!id || d.is_active === false) return null;
  return {
    id,
    slug: asStr(d.slug).trim().toLowerCase(),
    version: asStr(d.version),
    title: pick(d.title_json, d.title ?? d.name, locale),
    body: pick(d.body_json, d.body, locale),
  };
}

// GET /legal/consents — public list of the active documents (summaries, no body).
export async function listConsents(locale: string): Promise<ConsentDoc[]> {
  const raw = await http("/legal/consents", { auth: false });
  return listFrom(raw, "items", "data", "consents").map((x) => norm(x, locale)).filter((d): d is ConsentDetail => !!d);
}

// GET /legal/consents/{id} — the full text.
export async function getConsent(id: string, locale: string): Promise<ConsentDetail | null> {
  return norm(await http(`/legal/consents/${encodeURIComponent(id)}`, { auth: false }), locale);
}

// POST /legal/consents/{id}/accept (needs a token). "Already accepted" counts as done; resolves to
// false when it should be retried later (offline, 401, 429, 5xx). Never throws.
export async function acceptConsent(id: string, version: string): Promise<boolean> {
  try {
    await http(`/legal/consents/${encodeURIComponent(id)}/accept`, { method: "POST", body: version ? { version } : {} });
    return true;
  } catch (e) {
    if (!(e instanceof ApiError)) return true;
    return e.status === 409 || (e.status >= 400 && e.status < 500 && ![401, 408, 425, 429].includes(e.status));
  }
}
