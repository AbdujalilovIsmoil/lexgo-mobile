import { useState, type ComponentType } from "react";
import { useIsFocused } from "expo-router";

// iOS mounts every page of the system tab bar at launch (Android's tabs are lazy already). A tab page that has never been on view
// renders nothing, so a cold start does not build — and fetch for — pages nobody opened (the Services catalogue alone is megabytes).
// Once seen it stays mounted, as before.
export function lazyTab<P extends object>(Page: ComponentType<P>): ComponentType<P> {
  function LazyTab(props: P) {
    const focused = useIsFocused();
    const [seen, setSeen] = useState(focused);
    if (focused && !seen) setSeen(true);
    return seen ? <Page {...props} /> : null;
  }
  LazyTab.displayName = `LazyTab(${Page.displayName ?? Page.name})`;
  return LazyTab;
}
