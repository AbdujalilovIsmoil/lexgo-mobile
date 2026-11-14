import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Chip } from "../Chip";

type Option<T extends string> = { value: T; label: string; count?: number };
type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Idle chips on a white card (the surface colour) instead of the soft tint. */
  white?: boolean;
};

const PAD = 16;

// Single-select filter chips in one horizontally scrolling row. The chosen chip is scrolled into the middle of the row (as far as the
// row allows), so a chip tapped at the edge never stays cut off.
export function ChipBar<T extends string>({ options, value, onChange, white }: Props<T>) {
  const c = useColors();
  const ref = useRef<ScrollView>(null);
  const spots = useRef(new Map<string, { x: number; w: number }>());
  const box = useRef({ view: 0, content: 0 });

  const reveal = (v: string, animated = true) => {
    const spot = spots.current.get(v);
    const { view, content } = box.current;
    if (!spot || !view) return;
    const max = Math.max(0, content - view);
    ref.current?.scrollTo({ x: Math.min(max, Math.max(0, spot.x + spot.w / 2 - view / 2)), animated });
  };
  useEffect(() => reveal(value), [value]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: PAD, gap: 8, paddingVertical: 4 }}
      keyboardShouldPersistTaps="handled"
      onLayout={(e) => (box.current.view = e.nativeEvent.layout.width)}
      onContentSizeChange={(w) => (box.current.content = w)}
    >
      {options.map((o) => (
        <View
          key={o.value}
          onLayout={(e) => {
            const { x, width } = e.nativeEvent.layout;
            spots.current.set(o.value, { x, w: width });
            if (o.value === value) reveal(o.value, false); // the first layout: a preselected chip starts in view
          }}
        >
          <Chip label={o.count != null ? `${o.label} · ${o.count}` : o.label} active={o.value === value} onPress={() => onChange(o.value)} idleFill={white ? c.surface : undefined} />
        </View>
      ))}
    </ScrollView>
  );
}
