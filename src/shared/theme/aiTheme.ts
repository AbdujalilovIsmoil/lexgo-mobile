import { useTheme } from "./ThemeContext";

export type AiTheme = {
  bg: string;
  card: string;
  glass: string;
  glassStrong: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  user: readonly [string, string];
  bar: string;
  dark: boolean;
};

// The AI screen follows the app theme: a deep near-black navy in the dark, a soft blue-white in the light.
const dark: AiTheme = {
  bg: "#090E1B",
  card: "#121A2B",
  glass: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.09)",
  text: "#F1F5FC",
  muted: "#8B98AE",
  accent: "#5B9BFF",
  user: ["#1668F0", "#00A6E6"],
  bar: "#090E1B",
  dark: true,
};

const light: AiTheme = {
  bg: "#F4F7FF",
  card: "#FFFFFF",
  glass: "#FFFFFF",
  glassStrong: "#E8EEFC",
  border: "#E1E8F4",
  text: "#0A1526",
  muted: "#5C6E85",
  accent: "#1668F0",
  user: ["#1668F0", "#00A6E6"],
  bar: "#F4F7FF",
  dark: false,
};

export function useAiTheme(): AiTheme {
  return useTheme().dark ? dark : light;
}
