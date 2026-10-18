import { View } from "react-native";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { FieldCard, IconTile } from "@/shared/ui/profile";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { DeviceSession } from "../model/types";

const DESKTOP = /windows|mac|linux|desktop|chrome|firefox|edge|pc\b/i;
const MOBILE = /iphone|ipad|android|mobile|phone|expo/i;

// One signed-in device / refresh session: device mark, "this device" tag, last use and a sign-out button.
export function SessionRow({ item, onRevoke }: { item: DeviceSession; onRevoke: (s: DeviceSession) => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const last = item.lastUsedAt || item.createdAt;
  const label = item.deviceLabel || item.ip || t("admSecB.device");
  const desktop = DESKTOP.test(label) && !MOBILE.test(label);
  return (
    <FieldCard style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconTile accent={item.current ? "green" : "teal"} icon={desktop ? "monitor" : "smartphone"} size={42} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body" weight="bold" numberOfLines={1}>{label}</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{[item.ip, timeAgo(last, t)].filter(Boolean).join(" · ")}</Text>
          <Text variant="caption" tone="gray2" numberOfLines={1}>{`${t("admSecB.lastUsed")}: ${fmtDateTime(last, locale)}`}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {item.current ? <Pill label={t("admSecB.thisDevice")} tone="ok" icon="check" small /> : <View />}
        <PressableScale onPress={() => onRevoke(item)} hitSlop={8} accessibilityLabel={t("admSecB.revoke")} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.errBg }}>
          <Icon name="log-out" size={14} color={c.err} />
          <Text variant="caption" weight="bold" style={{ color: c.err }}>{t("admSecB.revoke")}</Text>
        </PressableScale>
      </View>
    </FieldCard>
  );
}
