import { Component, type ComponentType, type ReactNode } from "react";
import { UIManager, type ViewProps } from "react-native";

type BlurType = "chromeMaterialDark" | "chromeMaterialLight";
type CommunityBlurProps = ViewProps & { blurType: BlurType; blurAmount?: number; reducedTransparencyFallbackColor?: string };

// @react-native-community/blur has a native part. A build made before it was added does not contain it: importing it up front
// could crash the app at start-up and rendering it would raise a red error, so it is loaded on first use and wrapped in a boundary
// that shows `fallback` (the expo-blur layer) when the native view is missing. A missing native view can also render as nothing
// without an error (an over-the-air update on an older binary), so the view manager is checked before the component is used.
let cached: ComponentType<CommunityBlurProps> | null | undefined;
export function loadCommunityBlur(): ComponentType<CommunityBlurProps> | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = UIManager.hasViewManagerConfig("BlurView") ? (require("@react-native-community/blur") as { BlurView: ComponentType<CommunityBlurProps> }).BlurView : null;
  } catch {
    cached = null;
  }
  return cached;
}

export class BlurGuard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
