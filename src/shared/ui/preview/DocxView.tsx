import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { useColors } from "@/shared/theme";
import { OtherView } from "./OtherView";
import { loadDocxPage, readBase64 } from "./docxAsset";

type Props = { uri: string; name: string; mime?: string };

// A .docx read inside the app, on both platforms: the file is turned into HTML by a bundled page (mammoth) in a WebView.
// If that fails (a damaged file), the system "open with" is still offered.
export function DocxView({ uri, name, mime }: Props) {
  const c = useColors();
  const web = useRef<WebView>(null);
  const [page, setPage] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [state, setState] = useState<"load" | "ok" | "fail">("load");
  useEffect(() => {
    let alive = true;
    Promise.all([loadDocxPage(), readBase64(uri)]).then(([p, b]) => { if (alive) { setPage(p); setB64(b); } }).catch(() => alive && setState("fail"));
    return () => { alive = false; };
  }, [uri]);
  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string };
      if (m.type === "boot" && b64) web.current?.injectJavaScript(`window.__docx(${JSON.stringify(b64)});true;`);
      if (m.type === "done") setState("ok");
      if (m.type === "error") setState("fail");
    } catch {
      /* not ours */
    }
  };
  if (state === "fail") return <OtherView uri={uri} name={name} mime={mime} />;
  return (
    <View style={s.fill}>
      {page ? <WebView ref={web} source={{ html: page }} originWhitelist={["*"]} onMessage={onMessage} javaScriptEnabled style={s.fill} setSupportMultipleWindows={false} /> : null}
      {state === "load" ? <View style={[s.cover, { backgroundColor: c.bg }]}><ActivityIndicator color={c.accent} /></View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  cover: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
});
