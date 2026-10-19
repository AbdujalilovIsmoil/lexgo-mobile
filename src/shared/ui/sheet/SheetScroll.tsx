import { forwardRef, useRef } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useSheetFit } from "./SheetFitContext";

// Scrollable body of a sheet with the safe-area gap at the bottom and a gap at the top, so nothing sticks to the title or the handle.
// It also tells the sheet how tall its content is, so a short body gets a sheet that hugs it.
export const SheetScroll = forwardRef<ScrollView, ScrollViewProps>(function SheetScroll({ contentContainerStyle, onLayout, onContentSizeChange, ...rest }, ref) {
  const insets = useInsets();
  const fit = useSheetFit();
  const size = useRef({ vp: 0, ch: 0 });
  const push = () => { if (size.current.vp && size.current.ch) fit?.report(size.current.vp, size.current.ch); };
  return (
    <ScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={false}
      onLayout={(e) => { size.current.vp = e.nativeEvent.layout.height; push(); onLayout?.(e); }}
      onContentSizeChange={(w, h) => { size.current.ch = h; push(); onContentSizeChange?.(w, h); }}
      contentContainerStyle={[{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 16 }, contentContainerStyle]}
      {...rest}
    />
  );
});
