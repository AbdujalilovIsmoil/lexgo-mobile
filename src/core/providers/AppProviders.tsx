import { type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as SystemUI from "expo-system-ui";
import { ThemeProvider, useTheme } from "@/shared/theme";
import { IncomingCallWatcher } from "@/widgets/admin-meetings";
import { ClientSidebar } from "@/widgets/client-sidebar";
import { RootOverlays } from "@/shared/ui";
import { useProfileRefresh } from "@/entities/session";
import { useHostClipboardSync } from "../dev/useHostClipboardSync";
import { QueryProvider } from "./QueryProvider";
import { FontGate } from "./FontGate";
import { NavigationTheme } from "./NavigationTheme";
import { SessionBoundary } from "./SessionBoundary";
import { PackageMounts } from "./mounts";
import { SystemChrome } from "./SystemChrome";
import { UpdateMount } from "./UpdateMount";

// Dark from the very first frame; SystemChrome later follows the theme.
void SystemUI.setBackgroundColorAsync("#03102B").catch(() => {});

function Chrome({ children }: { children: ReactNode }) {
  const { dark } = useTheme();
  return (
    <NavigationTheme>
      <StatusBar style={dark ? "light" : "dark"} />
      <SystemChrome />
      {children}
      <RootOverlays />
      <IncomingCallWatcher />
      <ClientSidebar />
      <SessionBoundary />
      <PackageMounts />
      <UpdateMount />
    </NavigationTheme>
  );
}

// Order: gestures → keyboard → safe area → theme → data → fonts/session gate → navigation chrome.
export function AppProviders({ children }: { children: ReactNode }) {
  useHostClipboardSync();
  useProfileRefresh();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#03102B" }}>
      <KeyboardProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemeProvider>
            <QueryProvider>
              <FontGate>
                <Chrome>{children}</Chrome>
              </FontGate>
            </QueryProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
