export const PORTRAIT_RATIO = 4 / 5; // the reference portraits are 512x640 (width / height)

/** Largest picture of the given ratio that fits a box, in whole pixels (never zero-sized, never past the box). */
export function fitPicture(boxW: number, boxH: number, ratio = PORTRAIT_RATIO): { width: number; height: number } {
  if (!(boxW > 0) || !(boxH > 0) || !(ratio > 0)) return { width: 0, height: 0 };
  const width = Math.floor(Math.min(boxW, boxH * ratio));
  return { width, height: Math.floor(width / ratio) };
}
