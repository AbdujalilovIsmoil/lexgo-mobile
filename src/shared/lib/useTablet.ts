import { useWindowDimensions } from "react-native";

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
