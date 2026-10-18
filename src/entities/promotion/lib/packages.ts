import type { PromoPackage } from "../model/types";

// The «Eng foydali» (popular) package: the middle one of three or more, else the last. It is also pre-selected, like on the web.
export function popularId(items: Pick<PromoPackage, "id">[]): string {
  if (items.length >= 3) return items[1].id;
  return items.length ? items[items.length - 1].id : "";
}

/** The chosen package, or the popular one while the seller has not chosen. */
export function chosenPackage<T extends Pick<PromoPackage, "id">>(items: T[], id: string): T | null {
  return items.find((p) => p.id === id) ?? items.find((p) => p.id === popularId(items)) ?? null;
}
