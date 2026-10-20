// Semantic color slots; light/dark values live in colors.ts.
export type ThemeColors = {
  bg: string;
  canvas: string; // page background: transparent on iOS (the aurora shows through), the solid bg elsewhere
  glassFill: string; // card fill
  glassLine: string; // card hairline
  surface: string;
  surface2: string;
  glass: string;
  ink: string;
  gray: string;
  gray2: string;
  line: string;
  tint: string;
  tint2: string;
  accent: string;
  accentStrong: string;
  ok: string;
  okBg: string;
  err: string;
  errBg: string;
  warn: string;
  warnBg: string;
  cyBg: string;
  cyText: string;
};
