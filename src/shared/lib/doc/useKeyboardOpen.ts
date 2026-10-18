import { useKeyboardState } from "react-native-keyboard-controller";

// True while the software keyboard is up (sticky footers step aside for it).
export const useKeyboardOpen = (): boolean => useKeyboardState((s) => s.isVisible);
