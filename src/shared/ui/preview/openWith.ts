import { Platform } from "react-native";
import * as Sharing from "expo-sharing";

// "Open with…": Android hands a content:// uri to an installed app (VIEW intent);
// iOS and any failure fall back to the share sheet, which includes "Open in …".
export async function openWith(uri: string, mime?: string): Promise<void> {
  if (Platform.OS === "android") {
    try {
      const { getContentUriAsync } = await import("expo-file-system/legacy");
      const { startActivityAsync } = await import("expo-intent-launcher");
      const data = await getContentUriAsync(uri);
      await startActivityAsync("android.intent.action.VIEW", { data, flags: 1, type: mime || "*/*" });
      return;
    } catch {
      /* no app can open it: share instead */
    }
  }
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, mime ? { mimeType: mime } : undefined);
}
