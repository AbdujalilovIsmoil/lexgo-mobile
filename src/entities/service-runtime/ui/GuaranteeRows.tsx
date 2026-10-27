import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { minutesText } from "../lib/duration";
import type { Guarantee, GuaranteeIcon } from "../model/types";

const GLYPH: Record<GuaranteeIcon, IconName> = { shield: "shield", refund: "dollar-sign", clock: "clock", lock: "lock", star: "star", doc: "file-text", check: "check-circle" };

// The guarantees exactly as the backend returned them — the title, its text, when it applies, what happens and how fast — ten at a time.
// Nothing is added from the app's own texts.
export function GuaranteeRows({ items, reset = "" }: { items: Guarantee[]; reset?: string }) {
  const c = useColors();
  const { t } = useT();
  const page = useShowMore(items, reset);
  return (
    <View style={s.col}>
      {page.visible.map((g, i) => (
        <View key={g.id || `${g.title}-${i}`} style={s.row}>
          <Icon name={GLYPH[g.icon]} size={16} color={c.ok} />
          <View style={s.flex}>
            {g.title ? <Text variant="small" weight="bold">{g.title}</Text> : null}
            {g.description ? <Text variant="caption" tone="gray">{g.description}</Text> : null}
            {g.trigger ? <Text variant="caption" tone="gray">{t("srt.g.when", { text: g.trigger })}</Text> : null}
            {g.resolution ? <Text variant="caption" tone="gray">{t("srt.g.how", { text: g.resolution })}</Text> : null}
            {g.resolutionMinutes ? <Text variant="caption" weight="semibold" tone="ok">{t("srt.g.within", { time: minutesText(g.resolutionMinutes, t) })}</Text> : null}
          </View>
        </View>
      ))}
      <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1, gap: 2 },
});
