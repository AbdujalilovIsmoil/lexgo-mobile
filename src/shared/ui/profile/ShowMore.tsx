import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { Icon, PressableScale, Text } from "..";
import { PAGE } from "./useShowMore";

type Props = { left: number; expanded: boolean; onMore: () => void; onLess: () => void };

// The footer of a long list: "Show 10 more" (with how many are left), and "Show less" once everything is open.
export function ShowMore({ left, expanded, onMore, onLess }: Props) {
  const { t } = useT();
  if (!left && !expanded) return null;
  const more = left > 0;
  return (
    <PressableScale onPress={more ? onMore : onLess} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, borderRadius: 24, marginTop: 10, backgroundColor: "rgba(22,104,240,0.12)" }}>
      <Text variant="small" weight="bold" tone="accent">{more ? t("ntd.pgMore", { n: Math.min(PAGE, left) }) : t("ntd.pgLess")}</Text>
      {more ? <Text variant="caption" tone="gray">· {t("ntd.pgLeft", { n: left })}</Text> : null}
      <View><Icon name={more ? "chevron-down" : "chevron-up"} size={16} tone="accent" /></View>
    </PressableScale>
  );
}
