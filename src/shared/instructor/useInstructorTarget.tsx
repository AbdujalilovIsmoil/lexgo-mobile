import { useEffect, useRef, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useIsFocused } from "expo-router";
import { measureNode } from "./measure";
import { registerTarget } from "./registry";

type Opts = { label?: string; type?: string; onFocus?: () => void };

function useRegistered(id: string, opts: Opts, front: boolean) {
  const ref = useRef<View>(null);
  const focus = useRef(opts.onFocus);
  const { label = id, type = "section" } = opts;
  useEffect(() => {
    focus.current = opts.onFocus;
  });
  useEffect(() => {
    if (!front || !id) return;
    return registerTarget({ id, label, type, measure: () => measureNode(ref.current), focus: () => focus.current?.() });
  }, [id, label, type, front]);
  return { ref, collapsable: false } as const;
}

// Put an element on the assistant's map while its screen is in front. Spread the result on a View:
//   const pro = useInstructorTarget("plan:lexgo-ai-pro", { label: "LexGo.AI Pro", type: "card" });
//   <View {...pro}>…</View>
export function useInstructorTarget(id: string, opts: Opts = {}) {
  return useRegistered(id, opts, useIsFocused());
}

// For app-level UI that lives outside any screen (the floating button): registered while mounted.
export function useGlobalTarget(id: string, opts: Opts = {}) {
  return useRegistered(id, opts, true);
}

type BoxProps = Opts & { id: string; style?: StyleProp<ViewStyle>; children?: ReactNode };

// Wrapper form of the hook, for places where spreading props is awkward.
export function InstructorTarget({ id, label, type, onFocus, style, children }: BoxProps) {
  const t = useInstructorTarget(id, { label, type, onFocus });
  return (
    <View {...t} style={style}>
      {children}
    </View>
  );
}
