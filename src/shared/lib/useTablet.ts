import { useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";

// A tablet is any screen whose short side is at least 640 dp (every iPad, a 7"+ Android tablet; no phone gets near it). `docked` is the
// width at which the sidebar stays open beside the page instead of sliding over it (13" iPad upright, every iPad sideways).
const TABLET_MIN = 640;
const DOCK_MIN = 900;

export type TabletInfo = { tablet: boolean; docked: boolean; width: number; height: number };

export function useTablet(): TabletInfo {
  const { width, height } = useWindowDimensions();
  const tablet = Math.min(width, height) >= TABLET_MIN;
  return { tablet, docked: tablet && width >= DOCK_MIN, width, height };
}

// On a tablet the status bar follows the theme alone (light icons in the dark theme, dark icons in the light one) and sits on a strip of the theme's
// own colour, because the left of it is over the sidebar and the right over a page. A call fills the screen and keeps its own look.
export function useTabletStatus(): boolean {
  const { tablet } = useTablet();
  const path = usePathname();
  return tablet && !/^\/(manage\/)?call\//.test(path);
}
