import type { ProSeller } from "../model/types";

export type StatKey = "rating" | "reviews" | "experience" | "cases" | "success" | "completed";
export type Stat = { key: StatKey; value: string | null }; // null = unknown, shown as "—"

// The six tiles of the seller's profile header (as on the web page): unknown numbers stay empty instead of showing a fake 0.
export function profileStats(s: ProSeller): Stat[] {
  const known = (n: number) => (n > 0 ? String(n) : null);
  return [
    { key: "rating", value: s.reviews > 0 && s.rating > 0 ? s.rating.toFixed(1) : null },
    { key: "reviews", value: String(s.reviews) },
    { key: "experience", value: known(s.experienceYears) },
    { key: "cases", value: known(s.cases) },
    { key: "success", value: s.successRate > 0 ? `${s.successRate}%` : null },
    { key: "completed", value: String(s.completed ?? 0) },
  ];
}

// What the preview card shows for the service being edited: placeholders until it is filled in.
export type PreviewService = { name: string; category: string; price: number; filled: boolean };
export function previewService(picked: { name: string; category: string; catalogPrice: number } | null, typedPrice: number): PreviewService {
  const price = typedPrice > 0 ? typedPrice : (picked?.catalogPrice ?? 0);
  return { name: picked?.name ?? "", category: picked?.category ?? "", price, filled: !!picked };
}
