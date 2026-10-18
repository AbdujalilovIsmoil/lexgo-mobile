import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { openUrl } from "@/shared/lib/links";
import type { EditorSession } from "@/entities/doc-queue";
import { buildEditorHtml, EDITOR_MIN_WIDTH } from "../lib/bootstrap";
import { parseMsg, sameOrigin, type EditorMsg } from "../lib/bridge";

type Props = { session: EditorSession; onMsg: (m: EditorMsg) => void };

// The OnlyOffice editor in a WebView. Only the document-server origin may load; the server's config goes in untouched.
export function EditorWebView({ session, onMsg }: Props) {
  const { serverUrl, origin, config } = session;
  const narrow = useWindowDimensions().width < EDITOR_MIN_WIDTH;
  const html = useMemo(() => buildEditorHtml(serverUrl, config, narrow), [serverUrl, config, narrow]);
  return (
    <WebView
      source={{ html, baseUrl: origin }}
      originWhitelist={["*"]} // the allowlist below decides (the built-in one would hand any scheme to the OS)
      onMessage={(e) => {
        const m = parseMsg(e.nativeEvent.data);
        if (m) onMsg(m);
      }}
      onError={() => onMsg({ t: "fail", d: "load" })}
      onRenderProcessGone={() => onMsg({ t: "fail", d: "gone" })}
      onContentProcessDidTerminate={() => onMsg({ t: "fail", d: "gone" })}
      onHttpError={(e) => e.nativeEvent.statusCode >= 500 && onMsg({ t: "fail", d: "http" })}
      onShouldStartLoadWithRequest={(r) => {
        if (sameOrigin(r.url, origin)) return true;
        if (/^(https?|mailto|tel):/i.test(r.url)) openUrl(r.url);
        return false;
      }}
      setSupportMultipleWindows={false}
      javaScriptEnabled
      domStorageEnabled
      incognito
      allowFileAccess={false}
      mixedContentMode="never"
      overScrollMode="never"
      bounces={false}
      textZoom={100}
      automaticallyAdjustContentInsets={false}
      hideKeyboardAccessoryView
      style={{ flex: 1, backgroundColor: "#fff" }}
    />
  );
}
