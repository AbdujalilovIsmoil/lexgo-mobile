import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useWindowDimensions } from "react-native";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { SheetFrame } from "./SheetFrame";
import { SheetPanel } from "./SheetPanel";
import { useSheetMotion } from "./useSheetMotion";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  snaps?: number[]; // fractions of the screen height, ascending
  native?: boolean; // false → render inline (inside a transparent route)
};

// Draggable bottom drawer. Drag the handle to resize between snaps, pull it
// down (or flick) to dismiss, or tap the dark area. Covers the tab bar.
export function BottomSheet({ visible, onClose, children, title, subtitle, snaps = [0.56, 0.92], native = true }: Props) {
  const { height: H } = useWindowDimensions();
  const px = useMemo(() => snaps.map((f) => Math.round(f * H)), [snaps, H]);
  const [mounted, setMounted] = useState(visible);
  const { h, gesture, open, close } = useSheetMotion(px, () => {
    setMounted(false);
    onClose();
  });

  // Opening mounts at once (state derived during render); closing animates out first.
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    if (!visible && mounted) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    if (mounted && visible) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // A snap that changes while the sheet is open (content measured after the first frame) re-fits it.
  useEffect(() => {
    if (mounted && visible) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px[0]]);

  useEffect(() => {
    if (!mounted) return;
    useSheetsOpen.getState().enter();
    return () => useSheetsOpen.getState().leave();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <SheetFrame native={native} onRequestClose={close}>
      <SheetPanel h={h} gesture={gesture} low={px[0]} onClose={close} title={title} subtitle={subtitle}>
        {children}
      </SheetPanel>
    </SheetFrame>
  );
}
