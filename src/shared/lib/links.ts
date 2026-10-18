import { Linking } from "react-native";

// Phone dialer and http(s) links; failures are silent (no handler installed).
export const openTel = (phone: string) => void Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`).catch(() => {});
export const openUrl = (url: string) => void Linking.openURL(url).catch(() => {});
