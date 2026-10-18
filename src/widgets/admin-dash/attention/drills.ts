import type { Drill, DrillRow } from "@/entities/admin-dash";
import { roleLabel, statusLabel } from "@/entities/admin-reg";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import type { DashCtx } from "../lib/useDashCtx";
import { barsOf, countBars, lineOf, perDay } from "./charts";
import type { useAttention } from "./useAttention";

type A = ReturnType<typeof useAttention>;
const kv = (label: string, value: string): DrillRow => ({ label, value });

// Every drawer: the headline, the counters behind it and the real records (same data the web admin lists).
export function attentionDrills(x: DashCtx, a: A) {
  const { t, fmt, q, locale } = x;
  const tp = (k: string) => t(`admDashC.attn.${k}`);
  const d = (k: string) => t(`admDashB.drill.${k}`);
  const date = (v: string) => fmtDate(v, locale);
  const s = a.sellers?.stats;
  return {
    pay: (): Drill => ({ title: tp("pendingPay"), value: fmt.int(x.stat("pending_count")), sub: fmt.short(x.stat("pending_amount")), detail: { metric: "payments", filter: x.filter }, sections: [{ kind: "kv", rows: [
      kv(d("pending"), fmt.short(x.stat("pending_amount"))), kv(d("pendingCount"), fmt.int(x.stat("pending_count"))), kv(d("paid"), fmt.short(x.stat("paid_amount"))), kv(d("paidCount"), fmt.int(x.stat("paid_count"))),
    ] }, barsOf(d("payments"), [{ label: d("paid"), n: x.stat("paid_amount") ?? 0, text: fmt.short(x.stat("paid_amount")) }, { label: d("pending"), n: x.stat("pending_amount") ?? 0, text: fmt.short(x.stat("pending_amount")) }]), lineOf(d("trend"), x.trend, fmt.money)] }),
    sellers: (): Drill => ({ title: tp("sellers"), value: fmt.int(s?.pending), sub: tp("waiting"), sections: [
      { kind: "kv", rows: [kv(tp("total"), fmt.int(s?.total)), kv(roleLabel(t, "advokat"), fmt.int(s?.advokat)), kv(roleLabel(t, "yurist"), fmt.int(s?.yurist)), kv(roleLabel(t, "advokat_tashkiloti"), fmt.int(s?.advokatTashkiloti)), kv(tp("approved"), fmt.int(s?.approved)), kv(tp("rejected"), fmt.int(s?.rejected))] },
      barsOf(tp("status"), [{ label: tp("waiting"), n: s?.pending ?? 0, text: fmt.int(s?.pending) }, { label: tp("approved"), n: s?.approved ?? 0, text: fmt.int(s?.approved) }, { label: tp("rejected"), n: s?.rejected ?? 0, text: fmt.int(s?.rejected) }]),
      barsOf(tp("byRole"), [{ label: roleLabel(t, "advokat"), n: s?.advokat ?? 0, text: fmt.int(s?.advokat) }, { label: roleLabel(t, "yurist"), n: s?.yurist ?? 0, text: fmt.int(s?.yurist) }, { label: roleLabel(t, "advokat_tashkiloti"), n: s?.advokatTashkiloti ?? 0, text: fmt.int(s?.advokatTashkiloti) }]),
      lineOf(tp("perDay"), perDay(a.sellers?.items ?? [], (r) => r.createdAt)),
      { kind: "list", title: tp("waiting"), empty: tp("none"), rows: (a.sellers?.items ?? []).map((r) => ({ label: r.name || r.phone, value: roleLabel(t, r.role), sub: [r.phone, r.region, date(r.createdAt)].filter(Boolean).join(" · ") })) },
    ] }),
    payouts: (): Drill => ({ title: tp("payouts"), value: fmt.int(a.payouts?.count), sub: fmt.short(a.payouts?.amount), sections: [
      countBars(tp("status"), a.payouts?.all ?? [], (p) => p.status, (k) => statusLabel(t, k)),
      lineOf(tp("perDay"), perDay(a.payouts?.items ?? [], (p) => p.createdAt, (p) => p.sellerShare), fmt.money),
      { kind: "list", empty: tp("none"), rows: (a.payouts?.items ?? []).map((p) => ({ label: fmt.money(p.sellerShare), value: statusLabel(t, p.status), sub: [`${tp("gross")}: ${fmt.money(p.gross)}`, `${tp("fee")}: ${fmt.money(p.platformFee)}`, date(p.createdAt), p.note].filter(Boolean).join(" · ") })) },
    ] }),
    tasks: (): Drill => ({ title: tp("overdue"), value: fmt.int(a.tasks?.overdue), sub: a.tasks ? t("admDashC.attn.ofOpen", { n: a.tasks.open }) : undefined, sections: [
      { kind: "kv", rows: [kv(tp("total"), fmt.int(a.tasks?.total)), kv(tp("open"), fmt.int(a.tasks?.open)), kv(tp("overdue"), fmt.int(a.tasks?.overdue))] },
      countBars(tp("status"), a.tasks?.all ?? [], (i) => i.status),
      countBars(tp("byPriority"), a.tasks?.items ?? [], (i) => i.priority),
      lineOf(tp("perDay"), perDay(a.tasks?.items ?? [], (i) => i.due)),
      { kind: "list", empty: tp("none"), rows: (a.tasks?.items ?? []).map((i) => ({ label: i.title, value: date(i.due), tone: "bad", sub: [humanizeSlug(i.status), humanizeSlug(i.priority), i.caseTitle].filter(Boolean).join(" · ") })) },
    ] }),
    complaints: (): Drill => ({ title: tp("complaints"), value: fmt.pct(q?.complaintRate), sub: t("admDashC.attn.flagged", { n: fmt.int(q?.flagged.length ?? 0), p: fmt.pct(q?.resolvedPct) }), sections: [
      { kind: "kv", rows: [kv(d("complaints"), fmt.pct(q?.complaintRate)), kv(d("resolved"), fmt.pct(q?.resolvedPct)), kv(d("sla"), fmt.pct(q?.responseSlaPct)), kv(d("rating"), fmt.rating(q?.avgRating))] },
      barsOf(tp("quality"), [{ label: d("complaints"), n: q?.complaintRate ?? 0, text: fmt.pct(q?.complaintRate) }, { label: d("resolved"), n: q?.resolvedPct ?? 0, text: fmt.pct(q?.resolvedPct) }, { label: d("sla"), n: q?.responseSlaPct ?? 0, text: fmt.pct(q?.responseSlaPct) }]),
      countBars(tp("bySeverity"), q?.flagged ?? [], (f) => f.severity, (k) => x.label.severity(k)),
      { kind: "list", empty: tp("none"), rows: (q?.flagged ?? []).map((f) => ({ label: f.title, value: f.severity ? x.label.severity(f.severity) : "", tone: "bad", sub: f.detail })) },
    ] }),
  };
}
