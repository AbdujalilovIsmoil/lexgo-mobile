// Brand palette ported from law-main/app/globals.css (:root tokens).
export const brand = {
  b950: "#03102B",
  b900: "#0B1F45",
  b850: "#102A5C",
  b800: "#143676",
  b700: "#154CB0",
  b600: "#1668F0",
  b500: "#2E8BFF",
  b400: "#5CA8FF",
  b300: "#93C6FF",
  b200: "#C4DEFF",
  b100: "#E6F0FF",
  b50: "#F5F9FF",
  cy: "#00CFE8",
  cy2: "#00A6E6",
  white: "#FFFFFF",
} as const;

export const gradient = {
  // --grad: linear-gradient(135deg,#1668F0 0%,#00A6E6 62%,#00CFE8 100%)
  primary: ["#1668F0", "#00A6E6", "#00CFE8"] as const,
  primaryStops: [0, 0.62, 1] as const,
  // --grad-dark: linear-gradient(160deg,#0B1F45 0%,#123A86 55%,#0E5FC4 100%)
  dark: ["#0B1F45", "#123A86", "#0E5FC4"] as const,
  darkStops: [0, 0.55, 1] as const,
  // .hero h1 span text gradient
  heroText: ["#8FD8FF", "#00CFE8", "#B9F1FF"] as const,
} as const;

export const radius = { r: 14, rl: 20, rx: 28, pill: 999, sm: 10 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 16 } as const;
