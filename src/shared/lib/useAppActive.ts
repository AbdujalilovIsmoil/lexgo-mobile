import { useEffect, useState } from "react";
import { AppState } from "react-native";

/** Whether the app is in the foreground. "inactive" (Control Center, a system alert, Face ID over the app) still counts as foreground. */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState !== "background");
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => setActive(s !== "background"));
    return () => sub.remove();
  }, []);
  return active;
}
