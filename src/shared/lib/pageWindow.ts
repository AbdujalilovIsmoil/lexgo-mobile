// Ten rows at a time: the window grows by one page on scroll-end / "Yana 10 ta" and resets with any filter.
export const PAGE = 10;

export type PageInfo = { loaded: number; total: number; more: boolean };

// `loaded` = rows on screen, `total` = the real size of the (filtered) archive; total never reads below loaded.
export function pageInfo(loaded: number, total: number): PageInfo {
  const all = Math.max(loaded, total);
  return { loaded, total: all, more: loaded < all };
}

export const growWindow = (shown: number, total: number): number => Math.min(Math.max(total, PAGE), shown + PAGE);
// How many rows the next press adds ("Yana 10 ta", or "Yana 7 ta" for the last bit).
export const nextCount = (loaded: number, total: number): number => Math.max(0, Math.min(PAGE, total - loaded));
