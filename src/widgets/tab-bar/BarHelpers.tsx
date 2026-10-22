import { useEffect, useRef } from "react";
import { Text as RNText, View } from "react-native";
import { useSegments } from "expo-router";

// Two small components that watch things the bar needs to know about — so that the bar itself (and the tab page the system bar hosts, which is
// drawn again whenever the bar is) is drawn only when its OWN answer changes, not on every route change, text layout or timer tick.

// The real widths (at 10 pt, semibold) of the captions: hidden texts, measured once and reported in ONE batch, only when something really changed.
export function CaptionMeter({ texts, onWidths }: { texts: string[]; onWidths: (w: Record<string, number>) => void }) {
  const got = useRef<Record<string, number>>({});
  const sent = useRef<Record<string, number>>({});
  const report = () => {
    if (!texts.every((x) => got.current[x] !== undefined)) return;
    const same = texts.every((x) => Math.abs((sent.current[x] ?? -9) - got.current[x]) < 0.5);
    if (same) return;
    sent.current = { ...got.current };
    onWidths({ ...got.current });
  };
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: -200, left: 0, opacity: 0, alignItems: "flex-start" }}>
      {texts.map((x) => (
        <RNText key={x} numberOfLines={1} allowFontScaling={false} style={{ fontSize: 10, fontWeight: "600" }} onTextLayout={(e) => { const w = e.nativeEvent.lines[0]?.width; if (w) { got.current[x] = w; report(); } }}>{x}</RNText>
      ))}
    </View>
  );
}

// Coming back to the tabs from a pushed page, the system bar is laid out while the page is still sliding — narrow — and iOS keeps the captions
// cut to "Bosh…" / "Xiz…" for seconds after the slide ends. Once the slide is over, `onSettled` asks the bar to lay itself out again at its real
// width (one small change of the caption size). This component follows the route, so the bar does not have to.
export function ReturnWatcher({ onSettled }: { onSettled: () => void }) {
  const onTabs = useSegments()[0] === "(tabs)";
  const cb = useRef(onSettled);
  useEffect(() => { cb.current = onSettled; });
  useEffect(() => {
    if (!onTabs) return;
    const id = setTimeout(() => cb.current(), 500);
    return () => clearTimeout(id);
  }, [onTabs]);
  return null;
}
