import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { ConsentDoc, DocInput, UserConsent } from "../model/types";

function normDoc(v: unknown): ConsentDoc {
  const d = asDict(v);
  return {
    id: asStr(d.id ?? d.consent_id ?? d.document_id),
    slug: asStr(d.slug ?? d.type ?? d.code).trim().toLowerCase(),
    version: asStr(d.version ?? d.version_label),
    title: asStr(d.title ?? d.name),
    body: asStr(d.body ?? d.content ?? d.text),
    active: !(d.is_active === false || d.is_active === "false" || d.is_active === 0 || d.active === false),
    major: d.requires_reaccept === true,
    createdAt: asStr(d.created_at ?? d.published_at ?? d.updated_at),
  };
}

// GET /admin/legal/consents — every version of every document, active or not (users.manage).
export async function listDocs(): Promise<ConsentDoc[]> {
  return listFrom(await http("/admin/legal/consents"), "items", "data", "consents", "documents", "results").map(normDoc).filter((d) => d.id && d.slug);
}

// POST /admin/legal/consents — publishes a new version; major = users must accept it again.
export async function saveDoc(i: DocInput): Promise<ConsentDoc> {
  return normDoc(await http("/admin/legal/consents", { method: "POST", body: { slug: i.slug, version: i.version, title: i.title, body: i.body, is_active: i.active, requires_reaccept: i.major } }));
}

// GET /admin/legal/user-consents[?user_id=] — who accepted which version, when, from which IP.
// Every row embeds the full document text, which is ignored here.
export async function listUserConsents(userId: string): Promise<UserConsent[]> {
  const q = userId.trim() ? `?user_id=${encodeURIComponent(userId.trim())}` : "";
  return listFrom(await http(`/admin/legal/user-consents${q}`), "items", "data").map((x) => {
    const d = asDict(x);
    const doc = asDict(d.document);
    return { id: asStr(d.id), userId: asStr(d.user_id), consentId: asStr(d.consent_id), slug: asStr(d.slug ?? doc.slug), version: asStr(d.version ?? doc.version), acceptedAt: asStr(d.accepted_at), ip: asStr(d.ip_address ?? d.ip) };
  });
}

const docPath = (id: string) => `/admin/legal/consents/${encodeURIComponent(id)}`;

// PATCH /admin/legal/consents/{id} — fixes the text / flags of one published version in place (users.manage).
export async function patchDoc(id: string, i: Omit<DocInput, "slug">): Promise<ConsentDoc> {
  return normDoc(await http(docPath(id), { method: "PATCH", body: { version: i.version, title: i.title, body: i.body, is_active: i.active, requires_reaccept: i.major } }));
}

// PATCH …/{id} {is_active} — switches one version on or off without touching its text.
export async function setDocActive(id: string, active: boolean): Promise<ConsentDoc> {
  return normDoc(await http(docPath(id), { method: "PATCH", body: { is_active: active } }));
}

// DELETE /admin/legal/consents/{id} only deactivates a version (answers {id, is_active:false}; the row stays), so the
// app uses the on / off switch above instead of a delete button.
