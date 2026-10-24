import { View } from "react-native";
import { Button, IconButton, Text, backIcon } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { DocStatus, type DocReq } from "@/entities/doc-queue";
import { SaveChip, type Save } from "@/features/doc-editor";

type Props = { doc: DocReq; save: Save; canSend: boolean; onBack: () => void; onMenu: () => void; onSend: () => void };

// Compact header of the editor: back, title + status + save state, "send to client", more.
export function EditorBar({ doc, save, canSend, onBack, onMenu, onSend }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const c = useColors();
  return (
    <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.bg }}>
      <IconButton icon={backIcon} size={40} onPress={onBack} label={t("common.back")} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="small" weight="bold" numberOfLines={1}>{doc.title || doc.clientName}</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          <DocStatus status={doc.status} />
          <SaveChip save={save} />
        </View>
      </View>
      <Button title={t("ad3.send")} icon="send" size="sm" variant="gradient" disabled={!canSend} onPress={onSend} />
      <IconButton icon="more-horizontal" size={40} onPress={onMenu} label={t("ad1.more")} />
    </View>
  );
}
