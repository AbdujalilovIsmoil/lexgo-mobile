import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtBytes } from "@/shared/lib/pro/bytes";
import { Icon, Pill, PressableScale } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { kindIcon } from "../lib/kind";
import type { Folder, WFile } from "../model/types";

function More({ onPress, starred }: { onPress: () => void; starred: boolean }) {
  return (
    <View style={s.right}>
      {starred ? <Icon name="star" size={15} color="#F59E0B" /> : null}
      <PressableScale onPress={onPress} hitSlop={10}><Icon name="more-vertical" size={20} tone="gray" /></PressableScale>
    </View>
  );
}

export function FolderRow({ folder, onOpen, onMore }: { folder: Folder; onOpen: () => void; onMore: () => void }) {
  const { t } = useT();
  const sub = [t("aw8.items", { n: folder.fileCount + folder.folderCount }), fmtBytes(folder.size)].filter(Boolean).join(" · ");
  return <RowCard icon="folder" tint="#F59E0B" title={folder.name} subtitle={sub} right={<More onPress={onMore} starred={folder.starred} />} onPress={onOpen} />;
}

export function FileRow({ file, onOpen, onMore }: { file: WFile; onOpen: () => void; onMore: () => void }) {
  const { t, locale } = useT();
  const k = kindIcon(file.ext, file.mime);
  const bad = file.scan === "infected" || file.scan === "blocked";
  return (
    <RowCard icon={k.icon} tint={k.tint} title={file.name} subtitle={[file.ext.toUpperCase(), fmtBytes(file.size), fmtDate(file.createdAt, locale)].filter(Boolean).join(" · ")} right={<More onPress={onMore} starred={file.starred} />} onPress={onOpen}>
      {bad ? <Pill small tone="err" icon="shield-off" label={t("aw8.infected")} /> : null}
    </RowCard>
  );
}

const s = StyleSheet.create({ right: { flexDirection: "row", alignItems: "center", gap: 10 } });
