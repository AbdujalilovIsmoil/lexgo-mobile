export type ScanFilter = "original" | "document" | "gray" | "bw" | "color";
export const SCAN_FILTERS: ScanFilter[] = ["original", "document", "color", "gray", "bw"];

const IDENTITY = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
const gray = (c: number, shift: number) => {
  const t = 0.5 - 0.5 * c + shift;
  const row = [0.299 * c, 0.587 * c, 0.114 * c, 0, t];
  return [...row, ...row, ...row, 0, 0, 0, 1, 0];
};
const color = (c: number, shift: number) => {
  const t = 0.5 - 0.5 * c + shift;
  return [c, 0, 0, 0, t, 0, c, 0, 0, t, 0, 0, c, 0, t, 0, 0, 0, 1, 0];
};

// 4×5 colour matrices (translation in 0..1): the scanner looks — a flattened, high-contrast "document", boosted colour, plain grey and black & white.
export function matrixFor(f: ScanFilter): number[] {
  if (f === "document") return gray(1.55, 0.07);
  if (f === "color") return color(1.28, 0.03);
  if (f === "gray") return gray(1, 0);
  if (f === "bw") return gray(4, 0.12);
  return IDENTITY;
}
