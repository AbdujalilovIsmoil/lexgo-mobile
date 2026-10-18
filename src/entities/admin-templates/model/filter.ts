import type { Template } from "./types";

// Local search over title, category, slug and language (every word must match), optionally narrowed by
// state ("active" | "draft") and category.
export function filterTemplates(list: Template[], q: string, state = "", category = ""): Template[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((d) => {
    if (state && (state === "active") !== d.isActive) return false;
    if (category && d.category !== category) return false;
    const hay = [d.name, d.category, d.slug, d.language].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

// Categories that occur in the list, in first-seen order.
export const categoriesOf = (list: Template[]): string[] => [...new Set(list.map((d) => d.category).filter(Boolean))];
