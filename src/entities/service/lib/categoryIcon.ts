import type { IconName } from "@/shared/ui";
import type { ServiceCategory } from "../model/types";

// Icon per well-known category word; everything else falls back to "layers".
const ICONS: Record<string, IconName> = {
  fuqarolik: "users", civil: "users", jinoiy: "shield", criminal: "shield", oila: "heart", family: "heart",
  mehnat: "briefcase", labor: "briefcase", soliq: "percent", tax: "percent", biznes: "trending-up",
  business: "trending-up", iqtisodiy: "trending-up", korporativ: "layers", mulk: "home", "ko'chmas": "home",
  migratsiya: "globe", migration: "globe", intellektual: "award", shartnoma: "file-text", hujjat: "file-text",
  sud: "book-open", "ma'muriy": "clipboard", "ma’muriy": "clipboard", administrative: "clipboard",
};

export function categoryIcon(c: ServiceCategory): IconName {
  const key = `${c.slug} ${c.name}`.toLowerCase();
  const hit = Object.keys(ICONS).find((k) => key.includes(k));
  return hit ? ICONS[hit] : "layers";
}
