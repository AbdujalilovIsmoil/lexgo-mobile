import { Platform } from "react-native";
import { brand } from "./palette";
import type { ThemeColors } from "./types";

export type { ThemeColors } from "./types";


// Light values are the :root tokens; dark values the html[data-theme="dark"] ones. On iOS the canvas is the app-wide aurora and cards,
// wells and the page base turn into translucent glass tones; Android keeps the solid tokens.
const IOS = Platform.OS === "ios";
export const lightColors: ThemeColors = {
  bg: IOS ? "#EEF4FF" : brand.white,
  canvas: IOS ? "transparent" : brand.white,
  glassFill: IOS ? "rgba(255,255,255,0.68)" : brand.white,
  glassLine: IOS ? "rgba(255,255,255,0.95)" : "#E4EBF5",
  surface: brand.white,
  surface2: IOS ? "rgba(231,240,255,0.78)" : "#F1F4F9",
  glass: "rgba(255,255,255,0.9)",
  ink: "#0A1526",
  gray: IOS ? "#4F6178" : "#5C6E85",
  gray2: IOS ? "#66768C" : "#8A99AC",
  line: "#E4EBF5",
  tint: brand.b50,
  tint2: brand.b100,
  accent: brand.b600,
  accentStrong: brand.b700,
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
  bg: IOS ? "#060C1B" : "#0A1120",
  canvas: IOS ? "transparent" : "#0A1120",
  glassFill: IOS ? "rgba(255,255,255,0.075)" : "#121C31",
  glassLine: IOS ? "rgba(255,255,255,0.15)" : "#2C3D60",
  surface: "#121C31",
  surface2: IOS ? "rgba(255,255,255,0.09)" : "#18253E",
  glass: "rgba(14,22,40,0.86)",
  ink: "#E7EEF8",
  gray: "#A5B4C8",
  gray2: "#8494AB",
  line: "#2C3D60",
  tint: "#0D182C",
  tint2: "#172B4E",
  accent: "#6EA8FF",
  accentStrong: "#A3C8FF",
  ok: "#3DDC97",
  okBg: "rgba(52,211,153,0.14)",
  err: "#FF9494",
  errBg: "rgba(248,113,113,0.14)",
  warn: "#FBC15E",
  warnBg: "rgba(251,191,36,0.14)",
  cyBg: "rgba(96,165,250,0.14)",
  cyText: "#6EA8FF",
};
