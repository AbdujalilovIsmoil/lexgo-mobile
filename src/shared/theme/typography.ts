// Adliya: Manrope for display and body (Inter is kept only for the italic, which Manrope does not have). Loaded in core/providers/FontGate.
export const fonts = {
  display: "Manrope_800ExtraBold",
  displayBold: "Manrope_700Bold",
  body: "Manrope_400Regular",
  italic: "Inter_400Regular_Italic",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
} as const;

export type TextVariant =
  | "hx"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "lead"
  | "small"
  | "caption"
  | "kicker";

export const typography: Record<TextVariant, { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing?: number }> = {
  hx: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  h3: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  h4: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  lead: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1 },
};
