import { brand, mainColor, useTheme } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { SegmentItem } from "./segment/SegmentItem";
import { SegmentTrack } from "./segment/SegmentTrack";
import type { IconName } from "./Icon";

type Option<T> = { value: T; label: string; icon?: IconName };
type Props<T> = { options: Option<T>[]; value: T; onChange: (v: T) => void; variant?: "soft" | "solid" };

// Segmented control (tabs in a page, sheet or card; theme, language, billing period) in the calendar's look: a low white track with a
// hairline, the active segment on a navy thumb (the bottom bar's active colour) with white type, the others grey. The thumb glides to the
// active segment and the labels blend with it. (`variant` is kept for the callers; both look the same now.)
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors: c, dark, glass } = useTheme();
  const navy = dark || glass ? brand.b600 : mainColor;
  return (
    <SegmentTrack count={options.length} index={options.findIndex((o) => o.value === value)} track={dark || glass ? c.surface : "#FFFFFF"} trackBorder={dark || glass ? c.line : "#E6EBF3"} thumb={navy} thumbBorder={navy} radius={12}>
      {options.map((o, i) => (
        <SegmentItem key={o.value} selected={o.value === value} index={i} label={o.label} icon={o.icon} on="#FFFFFF" off={c.gray} iconOn="#FFFFFF" small={!!o.icon} onPress={() => { if (o.value !== value) selectHaptic(); onChange(o.value); }} />
      ))}
    </SegmentTrack>
  );
}
