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
  seeThrough: boolean; // the glass theme: the page is transparent over the app's glass ground
};

// The AI screen follows the app theme: a deep near-black navy in the dark, a soft blue-white in the light, see-through in the glass theme.
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
  seeThrough: false,
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
  seeThrough: false,
};

const glass: AiTheme = {
  bg: "transparent",
  card: "rgba(120,150,235,0.13)",
  glass: "rgba(255,255,255,0.07)",
  glassStrong: "rgba(255,255,255,0.13)",
  border: "rgba(255,255,255,0.13)",
  text: "#F2F6FD",
  muted: "#B8C4DC",
  accent: "#82B4FF",
  user: ["#1668F0", "#00A6E6"],
  bar: "rgba(10,20,48,0.55)",
  dark: true,
  seeThrough: true,
};

export function useAiTheme(): AiTheme {
  const t = useTheme();
  return t.glass ? glass : t.dark ? dark : light;
}
