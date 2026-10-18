// Pure-logic tests run in plain node: the few native modules they touch are replaced by in-memory fakes.
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
jest.mock("react-native", () => ({ Platform: { OS: "android", select: (o: Record<string, unknown>) => o.android ?? o.default }, StyleSheet: { create: <T,>(x: T) => x, hairlineWidth: 1, absoluteFill: {}, flatten: (x: unknown) => x }, AppState: { currentState: "active", addEventListener: () => ({ remove: () => undefined }) } }));
(globalThis as { __DEV__?: boolean }).__DEV__ = false;
jest.mock("expo-secure-store", () => {
  const mem = new Map<string, string>();
  return { getItemAsync: async (k: string) => mem.get(k) ?? null, setItemAsync: async (k: string, v: string) => void mem.set(k, v), deleteItemAsync: async (k: string) => void mem.delete(k) };
});
jest.mock("expo-device", () => ({ modelName: "Test", osName: "Test", osVersion: "1" }));
jest.mock("expo-haptics", () => ({ impactAsync: async () => undefined, notificationAsync: async () => undefined, selectionAsync: async () => undefined, ImpactFeedbackStyle: {}, NotificationFeedbackType: {} }));
