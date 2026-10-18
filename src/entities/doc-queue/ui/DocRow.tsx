import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Avatar, Icon, Pill, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import type { DocReq } from "../model/types";
import { statusTone } from "../model/status";
import { filesOf } from "../lib/sheetLogic";
import { isLate } from "../lib/listLogic";
import { AgoText } from "./AgoText";
import { DocStatus } from "./DocStatus";

const FLOW_ICON: Record<string, IconName> = { template_lawyer_assisted: "layers", custom_from_scratch: "edit-3", review_existing_document: "search" };

// A request card in three rows: type tile + title (2 lines); client monogram, name and how long ago (amber past 24 h);
// status pill, file count and the one quick action. The rest is in the sheet the card opens.
export function DocRow({ doc, onPress, index = 0, action }: { doc: DocReq; onPress: () => void; index?: number; action?: ReactNode }) {
  const { t } = useT();
  const c = useColors();
  const tone = { blue: c.accent, cy: c.accent, warn: c.warn, ok: c.ok, err: c.err, gray: c.gray, glass: c.gray }[statusTone(doc.status)];
  const key = `ad1.st.${doc.status}`;
  const status = t(key) === key ? humanizeSlug(doc.status) : t(key);
  const title = doc.title || doc.clientName || t("ad1.title");
  const files = filesOf(doc).length;
  const late = isLate(doc);
  return (
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 5) * 35)} style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={t("proDocSheet.openCard", { title, status })} style={s.press}>
        <View style={s.row}>
          <View style={[s.tile, { backgroundColor: `${tone}22` }]}><Icon name={FLOW_ICON[doc.flow] ?? "file-text"} size={20} color={tone} /></View>
          <Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{title}</Text>
          <Icon name="chevron-right" size={18} color={c.gray2} />
        </View>
        {doc.clientName ? (
          <View style={s.row}>
            <Avatar name={doc.clientName} size={24} />
            <Text variant="small" numberOfLines={1} style={s.flex}>{doc.clientName}</Text>
            <View style={s.ago}>
              {late ? <Icon name="clock" size={13} color={c.warn} /> : null}
              <AgoText iso={doc.createdAt} late={late} />
            </View>
          </View>
        ) : null}
      </PressableScale>
      <View style={s.foot}>
        <DocStatus status={doc.status} />
        {files ? <Pill label={String(files)} tone="gray" icon="paperclip" small /> : null}
        <View style={s.flex} />
        {action}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  press: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  tile: { width: 44, height: 44, borderRadius: radius.r, alignItems: "center", justifyContent: "center", marginRight: 2 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36 },
  ago: { flexDirection: "row", alignItems: "center", gap: 4 },
  flex: { flex: 1 },
});
