import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

// True while the on-screen keyboard is open (the floating button steps aside).
export function useKeyboardUp(): boolean {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", () => setUp(true));
    const b = Keyboard.addListener("keyboardDidHide", () => setUp(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return up;
}
