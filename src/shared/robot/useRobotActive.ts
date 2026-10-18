import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useNavigation } from "expo-router";

// True only while the screen that hosts the robot is focused AND the app is in the foreground: a hidden
// WebGL scene keeps burning CPU/GPU (and battery), so RobotView pauses it otherwise.
export function useRobotActive(): boolean {
  const nav = useNavigation();
  const [focused, setFocused] = useState(true);
  const [fg, setFg] = useState(AppState.currentState === "active");
  useEffect(() => {
    const a = nav.addListener("focus", () => setFocused(true));
    const b = nav.addListener("blur", () => setFocused(false));
    const c = AppState.addEventListener("change", (s) => setFg(s === "active"));
    return () => { a(); b(); c.remove(); };
  }, [nav]);
  return focused && fg;
}
