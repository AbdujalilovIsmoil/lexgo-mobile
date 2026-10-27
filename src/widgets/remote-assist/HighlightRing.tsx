import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { useRaMark, useRaStore } from "@/features/remote-assist";
import { findControl, type RaRect } from "@/shared/remote-assist";
import { Text } from "@/shared/ui";
import { brand, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const PAD = 6;
const same = (a: RaRect | null, b: RaRect | null) => a === b || (!!a && !!b && Math.abs(a.x - b.x) < 1.5 && Math.abs(a.y - b.y) < 1.5 && Math.abs(a.width - b.width) < 1.5 && Math.abs(a.height - b.height) < 1.5);

// Follows the marked control while the mark lasts (it may scroll or move); state changes only when it really moved. The mark itself
// ends after a few seconds, so this polling is bounded.
function useControlRect(id: string | null): RaRect | null {
  const [held, setHeld] = useState<{ id: string; rect: RaRect | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    const tick = async () => {
      const next = (await findControl(id)?.measure()) ?? null;
      if (alive) setHeld((cur) => (cur && cur.id === id && same(cur.rect, next) ? cur : { id, rect: next }));
    };
    void tick();
    const timer = setInterval(() => void tick(), 250);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id]);
  return id && held?.id === id ? held.rect : null;
}

/**
 * The operator's outline around a control (TZ RA §17 "strong visual indication"), with their note when they wrote one. A still ring
 * that appears and goes — no pulse, nothing endless — and never takes a touch: the client can press the control through it.
 */
export function HighlightRing() {
  const mark = useRaMark((s) => s.mark);
  const name = useRaStore((s) => s.session?.operator.name ?? "");
  const rect = useControlRect(mark?.id ?? null);
  return mark && rect ? <Ring key={mark.seq} rect={rect} text={mark.text} name={name} /> : null;
}

function Ring({ rect, text, name }: { rect: RaRect; text: string; name: string }) {
  const { t } = useT();
  const { width: W, height: H } = useWindowDimensions();
  const x = Math.max(2, rect.x - PAD);
  const y = Math.max(2, rect.y - PAD);
  const w = Math.min(W - x - 2, rect.width + 2 * PAD);
  const h = rect.height + 2 * PAD;
  const below = y + h + 96 < H;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View entering={ZoomIn.duration(220)} exiting={FadeOut.duration(160)} style={[s.ring, { left: x, top: y, width: w, height: h }]} />
      {text ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(160)} style={[s.note, below ? { top: y + h + 8 } : { bottom: H - y + 8 }]}>
          <Text variant="caption" style={s.who}>{name || t("ra.operator")}</Text>
          <Text variant="small" tone="white">{text}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  ring: { position: "absolute", borderRadius: 16, borderWidth: 3, borderColor: brand.cy, shadowColor: brand.cy, shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  note: { position: "absolute", left: 16, right: 16, borderRadius: radius.r, backgroundColor: brand.b900, padding: 12, gap: 2 },
  who: { color: "#93C6FF" },
});
