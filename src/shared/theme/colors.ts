import { Platform } from "react-native";
import { brand } from "./palette";
import type { ThemeColors } from "./types";

export type { ThemeColors } from "./types";


// Light values are the :root tokens; dark values the html[data-theme="dark"] ones. On iOS the canvas is the app-wide aurora and cards,
// wells and the page base turn into translucent glass tones; Android keeps the solid tokens.
const IOS = Platform.OS === "ios";
// Android is Material 3 Expressive: tonal surfaces (a card is a tinted container, not a white sheet with a border), LexGo blue roles.
export const lightColors: ThemeColors = {
  bg: IOS ? "#EEF4FF" : "#F4F7FF",
  canvas: IOS ? "transparent" : "#F4F7FF",
  glassFill: IOS ? "rgba(255,255,255,0.68)" : "#E8EEFC",
  glassLine: IOS ? "rgba(255,255,255,0.95)" : "#E8EEFC",
  surface: IOS ? brand.white : "#E8EEFC",
  surface2: IOS ? "rgba(231,240,255,0.78)" : "#D9E4FA",
  glass: "rgba(255,255,255,0.9)",
  ink: "#0A1526",
  gray: IOS ? "#4F6178" : "#3F4E69",
  gray2: IOS ? "#66768C" : "#566681",
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
  bg: IOS ? "#060C1B" : "#0B1120",
  canvas: IOS ? "transparent" : "#0B1120",
  glassFill: IOS ? "rgba(255,255,255,0.075)" : "#152036",
  glassLine: IOS ? "rgba(255,255,255,0.15)" : "#152036",
  surface: IOS ? "#121C31" : "#152036",
  surface2: IOS ? "rgba(255,255,255,0.09)" : "#1E2B49",
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
