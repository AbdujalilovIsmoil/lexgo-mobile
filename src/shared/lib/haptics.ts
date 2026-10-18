import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const ok = Platform.OS !== "web";

export const tapHaptic = () => {
  if (ok) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const selectHaptic = () => {
  if (ok) void Haptics.selectionAsync().catch(() => {});
};

export const successHaptic = () => {
  if (ok) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export const errorHaptic = () => {
  if (ok) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
