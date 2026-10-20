import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { Fade } from "./Fade";

type Props = { icon?: IconName; tint?: string; title?: string; sub?: string; right?: ReactNode; i?: number; fold?: string; children: ReactNode };

// One section of the seller home: a titled surface (the web's .ppanel) that eases in after the ones above it. With `fold` the
// section is folded away by default and its header shows that one-line summary (the heavy numbers, the payout ledger…); a tap on
// the header opens it with a short fade, so the page stays short and each part is one tap away.
export function Panel({ icon, tint, title, sub, right, i = 0, fold, children }: Props) {
  const c = useColors();
  const [open, setOpen] = useState(!fold);
  const head = (
    <View style={s.head}>
      {icon ? <View style={[s.ico, { backgroundColor: `${tint ?? c.accent}22` }]}><Icon name={icon} size={18} color={tint ?? c.accent} /></View> : null}
      <View style={s.titles}>
        <Text variant="h4" numberOfLines={1}>{title}</Text>
        {fold && !open ? <Text variant="caption" tone="gray" numberOfLines={2}>{fold}</Text> : sub ? <Text variant="caption" tone="gray" numberOfLines={2}>{sub}</Text> : null}
      </View>
      {open ? right : null}
      {fold ? <Icon name={open ? "chevron-up" : "chevron-down"} size={20} color={c.gray} /> : null}
    </View>
  );
  return (
    <Fade i={i}>
      <View style={[s.panel, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        {title ? fold ? <PressableScale onPress={() => setOpen((v) => !v)} scale={0.99} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={title}>{head}</PressableScale> : head : null}
        {open ? <Animated.View entering={FadeIn.duration(180)} style={s.body}>{children}</Animated.View> : null}
      </View>
    </Fade>
  );
}

const s = StyleSheet.create({ panel: { gap: 14, padding: 16, borderRadius: radius.rl, borderWidth: 1 }, head: { flexDirection: "row", alignItems: "center", gap: 10 }, titles: { flex: 1, gap: 2 }, ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }, body: { gap: 14 } });
