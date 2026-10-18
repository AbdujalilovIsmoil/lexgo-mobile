import { brand, radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { SegmentItem } from "./segment/SegmentItem";
import { SegmentTrack } from "./segment/SegmentTrack";
import type { IconName } from "./Icon";

type Option<T> = { value: T; label: string; icon?: IconName };
type Props<T> = { options: Option<T>[]; value: T; onChange: (v: T) => void; variant?: "soft" | "solid" };

// Pill segmented control (tabs in a sheet or card, theme, language, billing
// period). The thumb glides to the active segment and the labels blend with it;
// "solid" is the blue one.
export function Segmented<T extends string>({ options, value, onChange, variant = "soft" }: Props<T>) {
  const c = useColors();
  const solid = variant === "solid";
  return (
    <SegmentTrack count={options.length} index={options.findIndex((o) => o.value === value)} track={c.surface2} thumb={solid ? brand.b600 : c.surface} thumbBorder={solid ? brand.b600 : c.line} radius={radius.pill}>
      {options.map((o, i) => (
        <SegmentItem key={o.value} selected={o.value === value} index={i} label={o.label} icon={o.icon} on={solid ? "#FFFFFF" : c.ink} off={c.gray} iconOn={solid ? "#FFFFFF" : c.accent} small={!!o.icon} onPress={() => { if (o.value !== value) selectHaptic(); onChange(o.value); }} />
      ))}
    </SegmentTrack>
  );
}
