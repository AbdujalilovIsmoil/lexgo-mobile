import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { loadRobotHtml, loadRobotModel } from "./assets";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { useRobotActive } from "./useRobotActive";

export type RobotGesture = "wave" | "swagger" | "box" | "complain" | "frustrated";
export type RobotHandle = { play: (g: RobotGesture) => void };
type Props = { width: number; height: number; paused?: boolean; /** seconds between its own gestures (default 30); small = a lively robot */ every?: number; onReady?: () => void };

// The LexGo robot: a 3D mascot (the web's lexgo-robot.glb, same camera, lights, LED face, baked gestures)
// rendered by three.js inside a transparent WebView. It never takes touches — wrap it in a Pressable.
export const RobotView = forwardRef<RobotHandle, Props>(function RobotView({ width, height, paused, every, onReady }, ref) {
  const web = useRef<WebView>(null);
  const sheets = useSheetsOpen((s) => s.n);
  const active = useRobotActive() && sheets === 0;
  const [html, setHtml] = useState<string | null>(null);
  const run = (js: string) => web.current?.injectJavaScript(`${js};true;`);
  useEffect(() => { void loadRobotHtml().then(setHtml).catch(() => {}); }, []);
  useEffect(() => { run(`window.__robot&&window.__robot.pause(${!!paused || !active})`); });
  useEffect(() => { if (every) run(`window.__robot&&window.__robot.rhythm(${every})`); }, [every]);
  useImperativeHandle(ref, () => ({ play: (g) => run(`window.__robot&&window.__robot.play(${JSON.stringify(g)})`) }));
  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string };
      if (m.type === "boot") void loadRobotModel().then((b64) => run(`window.__robot.load(${JSON.stringify(b64)})`)).catch(() => {});
      if (m.type === "ready") { if (every) run(`window.__robot.rhythm(${every})`); onReady?.(); }
    } catch {
      /* not ours */
    }
  };
  return (
    <View pointerEvents="none" style={{ width, height }}>
      {html ? (
        <WebView
          ref={web} source={{ html }} originWhitelist={["*"]} onMessage={onMessage} javaScriptEnabled scrollEnabled={false} bounces={false}
          style={{ backgroundColor: "transparent" }} containerStyle={{ backgroundColor: "transparent" }} androidLayerType="hardware"
          setSupportMultipleWindows={false} allowsInlineMediaPlayback
        />
      ) : null}
    </View>
  );
});
