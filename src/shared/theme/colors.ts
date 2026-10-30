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
export const lightColors: ThemeColors = {
  bg: v("#EEF4FF", "#F4F7FF", brand.white),
  canvas: v("transparent", "#F4F7FF", brand.white),
  glassFill: v("rgba(255,255,255,0.68)", "#E8EEFC", brand.white),
  glassLine: v("rgba(255,255,255,0.95)", "#E8EEFC", "#E4EBF5"),
  surface: IOS ? brand.white : "#E8EEFC",
  surface2: v("rgba(231,240,255,0.78)", "#D9E4FA", "#F1F4F9"),
  glass: "rgba(255,255,255,0.9)",
  ink: "#0A1526",
  gray: v("#4F6178", "#3F4E69", "#5C6E85"),
  gray2: v("#66768C", "#566681", "#8A99AC"),
  line: IOS ? "#E4EBF5" : "#C5D1EA",
  tint: IOS ? brand.b50 : "#E1EAFF",
  tint2: IOS ? brand.b100 : "#CDDDFF",
  accent: brand.b600,
  accentStrong: IOS ? brand.b700 : "#0E4FC7",
  ok: "#00A870",
  okBg: "#E1F6EE",
  err: "#D92D20",
  errBg: "#FDECEC",
  warn: "#B45309",
  warnBg: "#FEF3C7",
  cyBg: "#DEF9FC",
  cyText: "#00707E",
};

export const darkColors: ThemeColors = {
  bg: v("#060C1B", "#0B1120", "#0A1120"),
  canvas: v("transparent", "#0B1120", "#0A1120"),
  glassFill: v("rgba(255,255,255,0.075)", "#152036", "#121C31"),
  glassLine: v("rgba(255,255,255,0.15)", "#152036", "#2C3D60"),
  surface: IOS ? "#121C31" : "#152036",
  surface2: v("rgba(255,255,255,0.09)", "#1E2B49", "#18253E"),
  glass: "rgba(14,22,40,0.86)",
  ink: "#E7EEF8",
  gray: "#A5B4C8",
  gray2: "#8494AB",
  line: IOS ? "#2C3D60" : "#2F4068",
  tint: IOS ? "#0D182C" : "#14213D",
  tint2: IOS ? "#172B4E" : "#223760",
  accent: IOS ? "#6EA8FF" : "#8DB6FF",
  accentStrong: IOS ? "#A3C8FF" : "#BBD3FF",
  ok: "#3DDC97",
  okBg: "rgba(52,211,153,0.14)",
  err: "#FF9494",
  errBg: "rgba(248,113,113,0.14)",
  warn: "#FBC15E",
  warnBg: "rgba(251,191,36,0.14)",
  cyBg: "rgba(96,165,250,0.14)",
  cyText: "#6EA8FF",
};

// Solid stand-in for `surface` where see-through would break the look (the tab bar, an input with a running light behind it).
export const GLASS_SOLID = "#14224D";

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
