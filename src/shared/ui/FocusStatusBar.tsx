import { useIsFocused } from "expo-router";
import { StatusBar, type StatusBarProps } from "expo-status-bar";
import { useTabletStatus } from "@/shared/lib/useTablet";

// Status bar override that only exists while its screen is focused. Tab screens
// stay mounted after you leave them, so a plain <StatusBar style="light" /> in a
// hero would keep winning over the theme-based root bar on light pages.
export function FocusStatusBar(props: StatusBarProps) {
  const focused = useIsFocused();
  const theme = useTabletStatus(); // a tablet: the root bar (theme-driven) decides
  return focused && !theme ? <StatusBar {...props} /> : null;
}
