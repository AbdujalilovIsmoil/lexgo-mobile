import { Stack } from "expo-router";
import { AppProviders } from "@/core";

export default function RootLayout() {
  return (
    <AppProviders>
      {/* freezeOnBlur: a screen covered by another one stops re-rendering until it is back on top (the whole tab group under a pushed page). */}
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", freezeOnBlur: true }}>
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
