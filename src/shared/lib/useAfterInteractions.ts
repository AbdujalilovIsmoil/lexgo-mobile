import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

// False for the first frames after mount, true once the screen transition and its first layout are done. Heavy, non-essential parts
// (a canvas, a long grid) wait for it, so the screen appears at once and fills in a moment later instead of stalling the transition.
export function useAfterInteractions(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);
  return ready;
}
