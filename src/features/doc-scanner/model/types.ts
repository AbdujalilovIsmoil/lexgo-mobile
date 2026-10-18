export type ScanPage = { id: string; uri: string; turns: number; exif: number; preview: string };
export const turnsFromExif = (orientation: number, w: number, h: number): number => {
  // 6 / 8 mean "stored sideways": rotate only when the pixels really are landscape (the picker may have turned them already).
  if (orientation === 3) return 2;
  if (orientation === 6) return w > h ? 1 : 0;
  if (orientation === 8) return w > h ? 3 : 0;
  return 0;
};
