import { useState, type ComponentType } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";
import { overlayPage, useTabOverlay } from "@/widgets/tab-bar/tabOverlay";
import { useColors } from "@/shared/theme";

// iOS mounts every page of the system tab bar at launch (Android's tabs are lazy already). A tab page that has never been on view
// renders nothing, so a cold start does not build — and fetch for — pages nobody opened (the Services catalogue alone is megabytes).
// Once seen it stays mounted, as before.
export function lazyTab<P extends object>(Page: ComponentType<P>): ComponentType<P> {
  function LazyTab(props: P) {
    const focused = useIsFocused();
    const [seen, setSeen] = useState(focused);
    if (focused && !seen) setSeen(true);
    const over = useTabOverlay((s) => s.name);
    const c = useColors();
    const Over = Platform.OS === "ios" && focused ? overlayPage(over) : undefined;
    if (!seen) return null;
    // iOS: a page opened over this tab (tabOverlay) — inside the system tab bar, so the bar stays.
    return (
      <>
        <Page {...props} />
        {Over ? <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]}><Over /></View> : null}
      </>
    );
  }
  LazyTab.displayName = `LazyTab(${Page.displayName ?? Page.name})`;
  return LazyTab;
}
