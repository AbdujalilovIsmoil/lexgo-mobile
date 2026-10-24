// The system bar sizes its items by content and cuts a caption that does not fit to "Xab…". Measured on iPhone 17 Pro: an item is its caption
// plus ~32 pt of padding, the AI slot takes ~60 pt, and the bar's inner width is the screen's minus 44 pt. These pick the caption size, the
// words and, as the last resort, no captions at all, so that nothing is ever cut.
export const ITEM_PAD = 32;
export const AI_SLOT = 60; // the AI item (the raised button stands over it)
export const GAP_SLOT = 44; // the empty item that keeps the AI slot in the middle when the tab count is even
export const BAR_MARGIN = 44;
const SAFETY = 6;
export const MAX_SIZE = 10.5;
export const MIN_SIZE = 8.5;

export type CaptionMode = "full" | "short" | "hidden";
export type Fit = { size: number; mode: CaptionMode };

// Widest size (≤ MAX_SIZE) at which captions whose widths at 10 pt are `w10` fit the bar next to `extra` pt of captionless items; 0 when even 0 pt does not (padding alone is too much).
export function fitSize(width: number, w10: number[], extra: number): number {
  const room = width - BAR_MARGIN - SAFETY - w10.length * ITEM_PAD - extra;
  const sum = w10.reduce((a, b) => a + b, 0);
  return sum <= 0 ? MAX_SIZE : Math.max(0, Math.min(MAX_SIZE, (10 * room) / sum));
}

// Full captions if they fit at a readable size, else the first word of each, else none.
export function captionFit(width: number, full10: number[], short10: number[], extra: number): Fit {
  const a = fitSize(width, full10, extra);
  if (a >= MIN_SIZE) return { size: Math.floor(a * 2) / 2, mode: "full" };
  const b = fitSize(width, short10, extra);
  if (b >= MIN_SIZE) return { size: Math.floor(b * 2) / 2, mode: "short" };
  return { size: MIN_SIZE, mode: "hidden" };
}

export const shortCaption = (s: string): string => s.trim().split(/\s+/)[0] ?? s;

// An item is never narrower than this before its padding (measured: iPhone 11 Pro, short captions → five items of equal width; iPhone 17 Pro,
// full captions → only "Bosh sahifa" is wider), so only captions longer than it move the AI slot off the centre.
export const ITEM_MIN = 40;

// Where the AI slot sits: the bar sizes its items by content and centres the row, so the slot is right of the screen centre by half of
// (left side − right side). `left` / `right`: the widths of the items on each side of the slot.
export const slotShift = (left: number[], right: number[]): number => (left.reduce((a, b) => a + b, 0) - right.reduce((a, b) => a + b, 0)) / 2;
