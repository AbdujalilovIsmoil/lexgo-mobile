import { fmtMoney } from "@/shared/lib/money";
import { humanizeSlug } from "@/shared/lib/format";
import type { PaymentRow } from "../model/types";

type T = (key: string, p?: Record<string, string | number>) => string;
const SLUG = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const slug = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, "_");

// "149 000 so'm" (whole UZS, never tiyin).
export const fmtUzs = (n: number, t: T): string => `${fmtMoney(n)} ${t("common.currency")}`;

const known = (t: T, ns: string, key: string): string => {
  const k = `${ns}.${key}`;
  const v = SLUG.test(key) ? t(k) : k;
  return v === k ? "" : v;
};

export const statusLabel = (status: string, t: T): string => known(t, "py1.status", slug(status)) || humanizeSlug(status) || "—";

// What a payment was for. The backend falls back to the raw target type as the description,
// so "monthly" or "order" are turned into words; real descriptions are shown as they are.
export function paymentTitle(p: Pick<PaymentRow, "description" | "kind">, t: T): string {
  const kind = known(t, "py1.kind", slug(p.kind));
  const d = slug(p.description);
  const period = known(t, "py1.period", d);
  if (period) return `${kind || t("py1.kind.subscription_plan")} · ${period}`;
  const asKind = known(t, "py1.kind", d);
  if (asKind) return asKind;
  if (p.description.trim() && !SLUG.test(p.description.trim())) return p.description.trim();
  return kind || humanizeSlug(d || slug(p.kind)) || "—";
}

// telegram_manual → "Telegram", atmos → "ATMOS": the channel a payment went through.
export const methodLabel = (method: string, t: T): string => known(t, "py1.method", slug(method)) || method.toUpperCase() || "—";
