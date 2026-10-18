import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { IconName } from "../Icon";
import { IconButton } from "../IconButton";
import { BottomSheet, SheetScroll } from "../sheet";
import { Text } from "../Text";
import type { Accent } from "./accents";
import { IconTile } from "./IconTile";
import { SheetActions } from "./SheetActions";

type Props = {
  visible: boolean; onClose: () => void; title: string; subtitle?: string; icon?: IconName; accent?: Accent; plain?: boolean;
  onSubmit?: () => void; submitLabel?: string; submitting?: boolean; disabled?: boolean;
  secondary?: { label: string; onPress: () => void }; snaps?: number[]; children: ReactNode;
};

// Profile bottom sheet: icon-tile header (or a plain title), soft body and a sticky Cancel / Save bar of 48pt pill buttons.
export function ProfileSheet({ visible, onClose, title, subtitle, icon = "edit-3", accent = "blue", plain, onSubmit, submitLabel, submitting, disabled, secondary, snaps = [0.7, 0.94], children }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const cancel = secondary ?? { label: t("adm.cancel"), onPress: onClose };
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={snaps}>
      <View style={s.head}>
        {plain ? null : <IconTile accent={accent} icon={icon} size={48} />}
        <View style={s.col}>
          <Text variant="h3" numberOfLines={1}>{title}</Text>
          {subtitle ? <Text variant="small" tone="gray" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <IconButton icon="x" size={36} onPress={onClose} label="close" />
      </View>
      <SheetScroll contentContainerStyle={s.body}>{children}</SheetScroll>
      {onSubmit ? (
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          <SheetActions cancel={cancel} submit={{ label: submitLabel ?? t("adm.save"), onPress: onSubmit, loading: submitting, disabled }} />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingBottom: 12 },
  col: { flex: 1, gap: 2 },
  body: { paddingTop: 14, gap: 14 },
  bar: { paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1 },
});
