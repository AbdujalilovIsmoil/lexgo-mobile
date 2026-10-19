import { useIsFocused } from "expo-router";
import { StatusBar, type StatusBarProps } from "expo-status-bar";

// Status bar override that only exists while its screen is focused. Tab screens
// stay mounted after you leave them, so a plain <StatusBar style="light" /> in a
// hero would keep winning over the theme-based root bar on light pages.
export function FocusStatusBar(props: StatusBarProps) {
  const focused = useIsFocused();
  return focused ? <StatusBar {...props} /> : null;
}
