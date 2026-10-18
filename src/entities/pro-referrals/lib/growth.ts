import { normUzPhone } from "@/shared/lib/phone";
import type { Invite } from "../model/types";

// Seller commission ladder (web rule S-28): 18% base, 16% from 5 active invitees, 15% from 10, 13% from 20.
export const BASE_PCT = 18;
export const TIERS: readonly { need: number; pct: number }[] = [
  { need: 5, pct: 16 },
  { need: 10, pct: 15 },
  { need: 20, pct: 13 },
];

export type Step = { need: number; pct: number; state: "done" | "current" | "next" | "locked" };
export type Ladder = {
  pct: number;
  steps: Step[]; // base level first
  next: { need: number; pct: number } | null;
  left: number; // invitations missing to the next level
  progress: number; // 0..1 inside the current -> next segment (1 at the top)
};

export function ladderOf(active: number): Ladder {
  const n = Math.max(0, Math.floor(active) || 0);
  const all = [{ need: 0, pct: BASE_PCT }, ...TIERS];
  const reached = all.filter((x) => n >= x.need);
  const cur = reached[reached.length - 1];
  const next = TIERS.find((x) => n < x.need) ?? null;
  const steps: Step[] = all.map((x) => ({
    ...x,
    state: x === cur ? "current" : n >= x.need ? "done" : next && x.need === next.need ? "next" : "locked",
  }));
  const progress = next ? (n - cur.need) / (next.need - cur.need) : 1;
  return { pct: cur.pct, steps, next, left: next ? next.need - n : 0, progress };
}

export type InviteKind = "pending" | "registered" | "active";

export function inviteKind(status: string): InviteKind {
  const s = status.trim().toLowerCase();
  if (["joined", "active", "rewarded", "paid", "completed"].includes(s)) return "active";
  if (["registered", "signed_up", "signup"].includes(s)) return "registered";
  return "pending";
}

// "Ali Valiyev" -> "Ali V.", a lone word is kept; empty stays empty.
export function maskName(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return "";
  if (w.length === 1) return w[0];
  return `${w[0]} ${w[1][0].toUpperCase()}.`;
}

// Phone without its middle digits ("+99890 *** 67"); anything unparseable is cut to first/last chars.
export function maskContact(phone: string): string {
  const p = phone.trim();
  if (!p) return "";
  const n = normUzPhone(p);
  if (n) return `${n.slice(0, 6)} *** ${n.slice(-2)}`;
  const d = p.replace(/\s+/g, "");
  return d.length <= 4 ? d : `${d.slice(0, 3)}***${d.slice(-2)}`;
}

export const inviteTitle = (i: Invite): string => maskName(i.name) || maskContact(i.phone) || "";
export const inviteSub = (i: Invite): string => (maskName(i.name) ? maskContact(i.phone) : "");

export const monogram = (i: Invite): string => {
  const src = maskName(i.name) || i.phone.replace(/\D/g, "").slice(-2);
  return (src.trim()[0] ?? "?").toUpperCase();
};

export function shareMessage(text: string, code: string, link: string): string {
  return [text, link || code].filter(Boolean).join(" ") + (link && code ? `\n${code}` : "");
}
