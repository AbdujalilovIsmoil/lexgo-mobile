// The AI screen is always dark (like the splash), whatever the app theme is.
export const aiTheme = {
  bg: ["#03102B", "#0B1F45", "#123A86"] as const,
  glass: "rgba(255,255,255,0.07)",
  glassStrong: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.13)",
  text: "#EAF2FF",
  muted: "#93A9CC",
  accent: "#5FD9FF",
  user: ["#1668F0", "#00A6E6"] as const,
  bar: "rgba(4,14,38,0.94)",
} as const;
