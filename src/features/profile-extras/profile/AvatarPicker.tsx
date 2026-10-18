import { View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { name: string; uri?: string; busy: boolean; onPick: () => void; onRemove: () => void };

// Big tappable avatar with a camera badge; "change photo" under it and a remove link when a photo is set.
export function AvatarPicker({ name, uri, busy, onPick, onRemove }: Props) {
  const { t } = useT();
  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <PressableScale onPress={onPick} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
        <Avatar name={name} uri={uri} size={96} />
        <View style={{ position: "absolute", right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: "#1668F0", borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
          <Icon name="camera" size={14} color="#FFFFFF" />
        </View>
      </PressableScale>
      <PressableScale onPress={onPick} disabled={busy} hitSlop={6}><Text variant="small" weight="bold" tone="accent">{t("py9.photo")}</Text></PressableScale>
      <Text variant="caption" tone="gray2" center>{t("cpr.photoHint")}</Text>
      {uri ? <PressableScale onPress={onRemove} hitSlop={6}><Text variant="caption" weight="bold" tone="err">{t("py9.photoRemove")}</Text></PressableScale> : null}
    </View>
  );
}
