import { Platform } from "react-native";
import { brand } from "./palette";
import { AURORA } from "./flags";
import type { ThemeColors } from "./types";

export type { ThemeColors } from "./types";


// Light values are the :root tokens; dark values the html[data-theme="dark"] ones. On iOS the canvas is the app-wide aurora and cards,
// wells and the page base turn into translucent glass tones; Android keeps the solid tokens.
const IOS = Platform.OS === "ios";
// v(aurora, material, plain): iOS with the aurora on / Android (Material 3) / iOS as it was before the aurora.
const v = (aurora: string, material: string, plain: string) => (IOS ? (AURORA ? aurora : plain) : material);
// Android is Material 3 Expressive: tonal surfaces (a card is a tinted container, not a white sheet with a border), LexGo blue roles.
// Adliya (Variant 06) light: the cool #F2F5FA ground, white cards with a soft hairline, navy ink, the #1D4ED8 blue.
export const lightColors: ThemeColors = {
  bg: v("#EEF3FB", "#F2F5FA", "#F2F5FA"),
  canvas: v("transparent", "#F2F5FA", "#F2F5FA"),
  glassFill: v("rgba(255,255,255,0.68)", brand.white, brand.white),
  glassLine: v("rgba(255,255,255,0.95)", "#E6EBF3", "#E6EBF3"),
  surface: brand.white,
  surface2: v("rgba(231,238,252,0.78)", "#E7EEFC", "#EEF2F8"),
  glass: "rgba(255,255,255,0.9)",
  ink: "#0B1A33",
  gray: "#5D6B83",
  gray2: "#7D8AA0",
  line: "#E2E8F1",
  tint: "#F2F6FE",
  tint2: "#E7EEFC",
  accent: brand.b600,
  accentStrong: brand.b900,
  ok: "#0F7B4C",
  okBg: "#DCF5E8",
  err: "#D1343B",
  errBg: "#FDE7E8",
  warn: "#A15C00",
  warnBg: "#FFF1D6",
  cyBg: "#E7EEFC",
  cyText: "#1A43B8",
};

// Adliya dark: the same navy family, deeper.
export const darkColors: ThemeColors = {
  bg: v("#060C1B", "#081226", "#081226"),
  canvas: v("transparent", "#081226", "#081226"),
  glassFill: v("rgba(255,255,255,0.075)", "#0F1E3D", "#0F1E3D"),
  glassLine: v("rgba(255,255,255,0.15)", "#1C2D52", "#1C2D52"),
  surface: "#0F1E3D",
  surface2: v("rgba(255,255,255,0.09)", "#172A50", "#152648"),
  glass: "rgba(10,22,46,0.88)",
  ink: "#E8EEF8",
  gray: "#A3B2CA",
  gray2: "#8191AB",
  line: "#22355C",
  tint: "#0D1A35",
  tint2: "#16294F",
  accent: "#7FA2F5",
  accentStrong: "#C9D6F0",
  ok: "#3DDC97",
  okBg: "rgba(52,211,153,0.14)",
  err: "#FF9494",
  errBg: "rgba(248,113,113,0.14)",
  warn: "#F2A33A",
  warnBg: "rgba(242,163,58,0.14)",
  cyBg: "rgba(127,162,245,0.14)",
  cyText: "#7FA2F5",
};

// Solid stand-in for `surface` where see-through would break the look (the tab bar, an input with a running light behind it).
export const GLASS_SOLID = "#122550";

// The "Shisha" (glass) theme: a deep navy ground with soft blue light behind every page (GlassBackdrop), cards and wells as panes of
// translucent white with a bright hairline, white type — the same on iOS and Android. Pages are transparent so the ground shows through.
export const glassColors: ThemeColors = {
  bg: "#0A1430",
  canvas: "transparent",
  glassFill: "rgba(120,150,235,0.13)",
  glassLine: "rgba(255,255,255,0.13)",
  surface: "rgba(120,150,235,0.13)",
  surface2: "rgba(255,255,255,0.08)",
  glass: "rgba(14,26,62,0.88)",
  ink: "#F2F6FD",
  gray: "#B8C4DC",
  gray2: "#8F9DBA",
  line: "rgba(255,255,255,0.12)",
  tint: "rgba(255,255,255,0.07)",
  tint2: "rgba(127,176,255,0.18)",
  accent: "#82B4FF",
  accentStrong: "#B8D3FF",
  ok: "#4ADE9F",
  okBg: "rgba(52,211,153,0.16)",
  err: "#FF9C9C",
  errBg: "rgba(248,113,113,0.16)",
  warn: "#FCC66B",
  warnBg: "rgba(251,191,36,0.16)",
  cyBg: "rgba(96,165,250,0.16)",
  cyText: "#82B4FF",
};
