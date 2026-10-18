import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { KeyboardLift } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";

const ScrollTo = createContext<(y: number) => void>(() => undefined);
// A section that is refused (empty, unchecked) asks the frame to bring it into view.
export const useFormScroll = () => useContext(ScrollTo);

// Scrolling form body with an optional sticky action bar; both rise above the keyboard.
export function FormFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const c = useColors();
  const insets = useInsets();
  const ref = useRef<ScrollView>(null);
  const scrollTo = useCallback((y: number) => ref.current?.scrollTo({ y, animated: true }), []);
  return (
    <KeyboardLift>
      <ScrollTo.Provider value={scrollTo}>
        <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </ScrollTo.Provider>
      {footer ? <View style={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 10 }}>{footer}</View> : null}
    </KeyboardLift>
  );
}
