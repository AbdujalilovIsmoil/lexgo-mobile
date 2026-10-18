import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { listServices } from "./serviceApi";
import { normService } from "./normalize";
import type { Service } from "../model/types";

const PAGE = 500;

// Only the picked category's own catalogue rows, every page (max 500 each) — never the whole catalogue.
export async function listCategoryServices(categoryId: string, locale = "uz"): Promise<Service[]> {
  const all: Service[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await listServices({ categoryId, catalogOnly: true, limit: PAGE, offset }, locale);
    all.push(...page);
    if (page.length < PAGE) break;
  }
  return all;
}

async function ranked(term: string, locale: string): Promise<Service[]> {
  const data = await http(`/services/search?${new URLSearchParams({ q: term, limit: "50" })}`);
  return listFrom(data, "results", "items", "services", "data").map((v) => {
    const d = v as Record<string, unknown>;
    return normService(d.service ?? d, locale);
  });
}

// Two endpoints, merged: /services/search ranks but returns at most 50, /services?q= is the plain
// filter that catches weak matches. Ranked hits keep their order and come first.
export async function searchCatalog(q: string, locale = "uz"): Promise<Service[]> {
  const term = q.trim().slice(0, 120);
  const [a, b] = await Promise.allSettled([ranked(term, locale), listServices({ q: term, catalogOnly: false, limit: 50 }, locale)]);
  const list = a.status === "fulfilled" ? a.value : [];
  const seen = new Set(list.map((s) => s.id));
  if (b.status === "fulfilled") for (const s of b.value) if (s.id && !seen.has(s.id)) { seen.add(s.id); list.push(s); }
  if (a.status === "rejected" && b.status === "rejected") throw a.reason;
  return list;
}
