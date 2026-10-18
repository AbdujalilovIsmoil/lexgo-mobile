import { Stack } from "expo-router";
import { AppProviders } from "@/core";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="auth/register" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/forgot" />
        <Stack.Screen name="lawyer/[id]" options={{ presentation: "transparentModal", animation: "none", contentStyle: { backgroundColor: "transparent" } }} />
        <Stack.Screen name="doc-analysis" />
        <Stack.Screen name="manage" />
        <Stack.Screen name="security" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
