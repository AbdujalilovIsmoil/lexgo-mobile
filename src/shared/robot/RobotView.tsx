import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AppState, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { loadRobotHtml, loadRobotModel } from "./assets";
import { AiOrb } from "@/shared/ui/AiOrb";
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
  const [shown, setShown] = useState(false); // the model is on screen; until then (or if it never loads) a glowing orb stands in
  const [gen, setGen] = useState(0); // bumped to build a fresh WebView (and WebGL context) after a crash or a lost context
  const [attempt, setAttempt] = useState(0);
  const run = (js: string) => web.current?.injectJavaScript(`${js};true;`);
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    loadRobotHtml().then((h) => alive && setHtml(h)).catch(() => { if (alive) timer = setTimeout(() => setAttempt((n) => n + 1), 3000); });
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [attempt]);
  // The WebGL surface can be lost while the app sleeps in the background. On return the page is asked whether its context survived: the
  // scene is rebuilt (a new WebView, three.js and the 3.5 MB model parsed again) only when it was lost or the page does not answer within
  // 3 s — not on every return. Only a return from the background: Control Center, a system alert or Face ID make the app "inactive" for a
  // moment and leave the scene intact.
  const checking = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fresh = useCallback(() => {
    clearTimeout(checking.current);
    checking.current = undefined;
    setShown(false); // the orb stands in until the new scene is up
    setGen((n) => n + 1);
  }, []);
  useEffect(() => {
    let prev = AppState.currentState;
    const sub = AppState.addEventListener("change", (st) => {
      if (prev === "background" && st === "active") {
        clearTimeout(checking.current);
        checking.current = setTimeout(fresh, 3000);
        web.current?.injectJavaScript("window.__robot&&window.__robot.check&&window.__robot.check();true;");
      }
      prev = st;
    });
    return () => { sub.remove(); clearTimeout(checking.current); };
  }, [fresh]);
  // A crashed/failed scene is rebuilt, but at most 3 times in 30 s: a WebView that fails at once would otherwise be
  // rebuilt in a loop and keep the JS thread busy. The orb stays in its place meanwhile.
  const crashes = useRef<number[]>([]);
  const rebuild = () => {
    const now = Date.now();
    crashes.current = crashes.current.filter((t) => now - t < 30_000);
    if (crashes.current.length >= 3) return setShown(false);
    crashes.current.push(now);
    fresh();
  };
  const still = !!paused || !active;
  // Sent when it changes and again once a new scene is up (`shown`), not on every render.
  useEffect(() => { run(`window.__robot&&window.__robot.pause(${still})`); }, [still, shown, gen]);
  useEffect(() => { if (every) run(`window.__robot&&window.__robot.rhythm(${every})`); }, [every]);
  useImperativeHandle(ref, () => ({ play: (g) => run(`window.__robot&&window.__robot.play(${JSON.stringify(g)})`) }));
  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string; lost?: boolean };
      if (m.type === "boot") void loadRobotModel().then((b64) => run(`window.__robot.load(${JSON.stringify(b64)})`)).catch(() => {});
      if (m.type === "ready") { if (every) run(`window.__robot.rhythm(${every})`); setShown(true); onReady?.(); }
      if (m.type === "alive") { if (m.lost) fresh(); else { clearTimeout(checking.current); checking.current = undefined; } }
      if (m.type === "lost" && AppState.currentState === "active") fresh(); // in the background the check on return decides
    } catch {
      /* not ours */
    }
  };
  return (
    <View pointerEvents="none" style={{ width, height }}>
      {shown ? null : <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}><AiOrb size={Math.round(Math.min(width, height) * 0.4)} icon="star" live={!still} /></View>}
      {html ? (
        <WebView
          key={gen} ref={web} onRenderProcessGone={rebuild} onContentProcessDidTerminate={rebuild} onError={rebuild} source={{ html }} originWhitelist={["*"]} onMessage={onMessage} javaScriptEnabled scrollEnabled={false} bounces={false}
          style={{ backgroundColor: "transparent" }} containerStyle={{ backgroundColor: "transparent" }} androidLayerType="hardware"
          setSupportMultipleWindows={false} allowsInlineMediaPlayback
        />
      ) : null}
    </View>
  );
});
