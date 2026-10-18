import type { UrgentCatalog, UrgentGroup, UrgentService } from "./catalogTypes";

// What the client sees on the grid: a service, or a box of kinds that are one decision.
export type UrgentCard = { key: string; items: UrgentService[]; group?: UrgentGroup };

export const VIDEO_GROUP = "video_consultation_kind";
const VIDEO_ITEMS = ["video_consultation", "express_video_consultation"];
// Chat is the route for someone who cannot speak, the road accident a single situation — both come before the rest.
const ORDER = ["video_consultation", "chat_consultation", "traffic_accident_consultation"];

// The catalog groups the two second opinions; the ordinary + express video pair is grouped here (as on the web).
export function groupsOf(cat: UrgentCatalog | undefined): UrgentGroup[] {
  const own = cat?.groups ?? [];
  const keys = cat?.services.map((s) => s.key) ?? [];
  const taken = new Set(own.flatMap((g) => g.items));
  const both = VIDEO_ITEMS.every((k) => keys.includes(k)) && !VIDEO_ITEMS.some((k) => taken.has(k));
  return both ? [...own, { key: VIDEO_GROUP, title: "", items: VIDEO_ITEMS }] : own;
}

export function buildCards(cat: UrgentCatalog | undefined): UrgentCard[] {
  if (!cat) return [];
  const groups = groupsOf(cat);
  const out: UrgentCard[] = [];
  const placed = new Set<string>();
  for (const s of cat.services) {
    const g = groups.find((x) => x.items.includes(s.key));
    if (!g) out.push({ key: s.key, items: [s] });
    else if (!placed.has(g.key)) {
      placed.add(g.key);
      out.push({ key: g.key, group: g, items: cat.services.filter((x) => g.items.includes(x.key)) });
    }
  }
  const rank = (c: UrgentCard) => c.items.reduce((best, x) => (ORDER.indexOf(x.key) >= 0 ? Math.min(best, ORDER.indexOf(x.key)) : best), ORDER.length);
  return out.sort((a, b) => rank(a) - rank(b));
}
