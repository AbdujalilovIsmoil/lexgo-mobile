import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import { Text } from "../Text";
import { PreviewBody } from "./PreviewBody";
import { shareFile } from "@/shared/lib/files";
import { useFileSource, type FileRef } from "./useFileSource";

type Props = { visible: boolean; onClose: () => void; file: FileRef | null };

// Full-screen preview of an authenticated file or a local uri (TZ 29). Shows a
// download progress bar with cancel, then the right viewer for the format.
export function FilePreview({ visible, onClose, file }: Props) {
  const c = useColors();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const { state, uri, kind, retry, cancel } = useFileSource(visible ? file : null);
  const title = state.name ?? file?.name ?? "";
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={[s.root, { backgroundColor: c.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
        <View style={s.head}>
          <IconButton icon="x" onPress={() => { cancel(); onClose(); }} />
          <Text variant="h4" numberOfLines={1} style={{ flex: 1 }}>{title}</Text>
          {uri ? <IconButton icon="share" onPress={() => void shareFile(uri, file?.mime)} /> : null}
        </View>
        {state.phase === "loading" ? (
          <View style={s.center}>
            <ActivityIndicator color={c.accent} />
            <Text tone="gray">{Math.round(state.progress * 100)}%</Text>
            <Button title={t("common.cancel")} variant="soft" onPress={cancel} />
          </View>
        ) : state.phase === "error" ? (
          <View style={s.center}>
            <Text tone="gray" center>{t("fnd1.preview.failed")}</Text>
            <Button title={t("fnd1.preview.retry")} onPress={retry} />
          </View>
        ) : uri ? <PreviewBody uri={uri} kind={kind} name={title} mime={file?.mime} /> : null}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
