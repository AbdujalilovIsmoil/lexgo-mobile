// Onest = display (--fd), Inter = body (--fb). Loaded in app/providers/FontGate.
export const fonts = {
  display: "Onest_800ExtraBold",
  displayBold: "Onest_700Bold",
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
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
  hx: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -1.2 },
  h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.8 },
  h3: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, letterSpacing: -0.5 },
  h4: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  lead: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1 },
};
