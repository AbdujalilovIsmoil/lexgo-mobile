import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useWindowDimensions } from "react-native";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";
import { useInsets } from "@/shared/lib/insets";
import { fitSnaps } from "./fitSnaps";
import { SheetFitContext } from "./SheetFitContext";
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
  expandable?: boolean; // forms: the top snap stays reachable even when the content is shorter
  guardClose?: () => boolean; // true → the close is held back (the caller asks first) and the sheet stays open
};

// Draggable bottom drawer. Drag the handle to resize between snaps, pull it
// down (or flick) to dismiss, or tap the dark area. Covers the tab bar.
export function BottomSheet({ visible, onClose, children, title, subtitle, snaps = [0.56, 0.92], native = true, expandable, guardClose }: Props) {
  const { height: H } = useWindowDimensions();
  const insets = useInsets();
  // Header + the content's own height (reported by a SheetScroll inside): short content hugs, long content scrolls.
  const [fit, setFit] = useState<number | null>(null);
  const m = useRef({ header: 0, wrap: 0, viewport: 0, content: 0 });
  const closingNow = useRef<() => boolean>(() => false);
  const room = H - insets.top - 10;
  const px = useMemo(() => fitSnaps(snaps.map((f) => Math.round(f * H)), fit, room, expandable), [snaps, H, fit, room, expandable]);
  const fitApi = useMemo(() => {
    const recompute = () => {
      if (closingNow.current()) return; // the sheet is shrinking away: its sizes say nothing about the content
      const { header, wrap, viewport, content } = m.current;
      if (!header || !wrap || !viewport) return;
      const next = Math.round(header + wrap - viewport + content + 2);
      setFit((cur) => (cur !== null && Math.abs(cur - next) < 3 ? cur : next));
    };
    return {
      report: (viewport: number, content: number) => { m.current.viewport = viewport; m.current.content = content; recompute(); },
      setHeader: (v: number) => { m.current.header = v; recompute(); },
      setWrap: (v: number) => { m.current.wrap = v; recompute(); },
    };
  }, []);
  const [mounted, setMounted] = useState(visible);
  const [refused, setRefused] = useState(0);
  const { h, gesture, open, refit, close, isClosing } = useSheetMotion(px, () => {
    if (guardClose?.()) return setRefused((n) => n + 1); // a refused drag-dismiss springs back (effect below)
    setMounted(false);
    onClose();
  });
  useEffect(() => {
    closingNow.current = isClosing;
  });
  const ask = () => { if (!guardClose?.()) close(); };

  // Opening mounts at once (state derived during render); closing animates out first.
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    if (refused) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refused]);
  useEffect(() => {
    if (!visible && mounted) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    if (mounted && visible) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // A snap that changes while the sheet is open (content measured after the first frame) re-fits it — never while it closes.
  useEffect(() => {
    if (mounted && visible) refit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px[0]]);

  useEffect(() => {
    if (!mounted) return;
    useSheetsOpen.getState().enter();
    return () => useSheetsOpen.getState().leave();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <SheetFrame native={native} onRequestClose={ask}>
      <SheetFitContext.Provider value={fitApi}>
        <SheetPanel h={h} gesture={gesture} low={px[0]} onClose={ask} title={title} subtitle={subtitle}>
          {children}
        </SheetPanel>
      </SheetFitContext.Provider>
    </SheetFrame>
  );
}
