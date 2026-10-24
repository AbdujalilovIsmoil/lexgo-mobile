import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const ios = Platform.OS === "ios";
// Android gets the system's own touch feedback (light, follows the phone's touch-feedback setting) instead of the vibrator motor that
// impactAsync / notificationAsync drive there: that buzz is foreign to Android and spends battery on every tap.
const android = (type: Haptics.AndroidHaptics) => {
  if (Platform.OS === "android") void Haptics.performAndroidHapticsAsync(type).catch(() => {});
};

export const tapHaptic = () => {
  if (ios) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else android(Haptics.AndroidHaptics.Virtual_Key);
};

export const selectHaptic = () => {
  if (ios) void Haptics.selectionAsync().catch(() => {});
  else android(Haptics.AndroidHaptics.Clock_Tick);
};

export const successHaptic = () => {
  if (ios) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else android(Haptics.AndroidHaptics.Confirm);
};

export const errorHaptic = () => {
  if (ios) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  else android(Haptics.AndroidHaptics.Reject);
};
