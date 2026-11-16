// Brand palette ported from law-main/app/globals.css (:root tokens).
// Adliya (Variant 06): the Mezon navy + blue scale. The names are the old ones, so every screen picks the new colours up.
export const brand = {
  b950: "#06132B",
  b900: "#0A1F44",
  b850: "#0F2A5E",
  b800: "#13357A",
  b700: "#1A43B8",
  b600: "#1D4ED8",
  b500: "#3B6CF0",
  b400: "#7FA2F5",
  b300: "#A9C1F7",
  b200: "#C9D6F0",
  b100: "#E7EEFC",
  b50: "#F2F6FE",
  cy: "#00CFE8",
  cy2: "#00A6E6",
  white: "#FFFFFF",
} as const;

// The app's main colour: the Adliya navy of the header bands. The same in every theme.
export const mainColor = "#0A1F44";
// Adliya's amber, for the "waiting for payment" kind of notes.
export const amber = { bg: "#FFF8EA", line: "#F4D9A8", tile: "#FFE9C2", ink: "#9A5B00", sub: "#7A5A2A" } as const;

// General colour scale: fixed values, the same in every theme. For colours that must follow light/dark/glass, use useColors().
export const palette = {
  primary25: "#F5F3FF",
  primary50: "#EEF2FF",
  primary100: "#E0E7FF",
  primary400: "#7C7EDB",
  primary500: "#5E60CE",
  primary600: "#4F46E5",

  success50: "#F0FDF4",
  success100: "#D1FAE5",
  success200: "#A7F3D0",
  success300: "#6EE7B7",
  success400: "#34D399", // not in the light semantic scales: mapped to emerald-400
  success500: "#10B981",
  success600: "#059669",

  warning50: "#FFF7ED",
  warning100: "#FFEDD5",
  warning200: "#FED7AA",
  warning300: "#FDBA74",
  warning400: "#FB923C",
  warning500: "#F59E0B",
  warning600: "#D97706",
  warning700: "#B45309",
  warning800: "#92400E",

  error50: "#FEF2F2",
  error500: "#EF4444",

  neutral50: "#F9FAFB",
  neutral75: "#F0F2F5",
  neutral100: "#F3F4F6",
  neutral200: "#E5E7EB",
  neutral400: "#9CA3AF",
  neutral500: "#6B7280",
  neutral700: "#374151",
  neutral900: "#111827",
  neutral950: "#1A1A2E",

  white: "#FFFFFF",
} as const;

export const gradient = {
  // Adliya primary: the solid blue CTA with a little depth.
  primary: ["#3B6CF0", "#1D4ED8", "#1A43B8"] as const,
  primaryStops: [0, 0.55, 1] as const,
  // Adliya header band: linear-gradient(150deg,#13357A,#0A1F44 65%)
  dark: ["#13357A", "#0A1F44", "#081631"] as const,
  darkStops: [0, 0.65, 1] as const,
  // .hero h1 span text gradient
  heroText: ["#C9D6F0", "#7FA2F5", "#E7EEFC"] as const,
} as const;

export const radius = { r: 14, rl: 18, rx: 24, pill: 999, sm: 10 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 16 } as const;
