import type { DocRow } from "../model/types";
import { needsClient } from "./status";

export type DocItem = { id: string; head?: "you" | "rest"; n?: number; row?: DocRow };

// "Waiting on you" (fill in / pay) first, then the rest — like the web list. Headers only
// appear when something is waiting on the client; they count what is loaded.
export function sectionize(rows: DocRow[]): DocItem[] {
  const you = rows.filter((r) => needsClient(r.status));
  if (!you.length) return rows.map((row) => ({ id: row.id, row }));
  const rest = rows.filter((r) => !needsClient(r.status));
  const out: DocItem[] = [{ id: "h-you", head: "you", n: you.length }, ...you.map((row) => ({ id: row.id, row }))];
  return rest.length ? [...out, { id: "h-rest", head: "rest", n: rest.length }, ...rest.map((row) => ({ id: row.id, row }))] : out;
}

export type DocPrice = { kind: "wait" | "off" | "paid" | "info" | "none"; amount: number };

// Footer money line: payment wait/cancel states win, then paid vs the plain service price.
export function priceOf(r: DocRow, paid: boolean): DocPrice | null {
  const s = r.status.toLowerCase();
  if (s.startsWith("payment_c") || s.startsWith("payment_r") || s === "cancelled" || s === "rejected") return { kind: "off", amount: r.price };
  if (r.paymentRequired && !r.fileReady) return { kind: "wait", amount: r.price };
  if (r.price > 0) return { kind: paid ? "paid" : "info", amount: r.price };
  return r.mode !== "lawyer" && s !== "closed" ? { kind: "none", amount: 0 } : null;
}
