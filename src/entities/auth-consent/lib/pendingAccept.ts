import { readJson, writeJson } from "@/shared/lib/storage";
import { acceptConsent } from "../api/consentApi";
import type { ConsentDoc, PendingConsents } from "../model/types";

const KEY = "lexgo_pending_consents";
const digits = (p: string) => p.replace(/\D/g, "").slice(-9);

// What was ticked at sign-up is posted once a token exists: right away, or — for accounts that wait
// for an admin (no token yet) — at the first sign-in of the same phone. Not secret, only ids.
export async function rememberConsents(phone: string, docs: ConsentDoc[]): Promise<void> {
  await writeJson(KEY, { phone, docs: docs.map((d) => ({ id: d.id, version: d.version })) } satisfies PendingConsents);
}

export async function flushConsents(phone: string): Promise<void> {
  const p = await readJson<PendingConsents>(KEY);
  if (!p || digits(p.phone) !== digits(phone)) return;
  const left: PendingConsents["docs"] = [];
  for (const d of p.docs) if (!(await acceptConsent(d.id, d.version))) left.push(d);
  await writeJson(KEY, left.length ? { phone: p.phone, docs: left } : null);
}
