import { Platform } from "react-native";
import { WebView } from "react-native-webview";
import { OtherView } from "./OtherView";

// DOC/DOCX/XLS/XLSX: iOS WKWebView renders Office files natively from the cache;
// Android has no such renderer, so it opens the file in an installed app.
export function OfficeView({ uri, name, mime }: { uri: string; name: string; mime?: string }) {
  if (Platform.OS !== "ios") return <OtherView uri={uri} name={name} mime={mime} />;
  return <WebView source={{ uri }} allowingReadAccessToURL={uri} originWhitelist={["file://*"]} javaScriptEnabled={false} domStorageEnabled={false} style={{ flex: 1 }} />;
}
