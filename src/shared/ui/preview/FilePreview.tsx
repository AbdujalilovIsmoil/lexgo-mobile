import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import { Text } from "../Text";
import { OverlayHost } from "../overlay/OverlayHost";
import { PreviewBody } from "./PreviewBody";
import { shareFile } from "@/shared/lib/files";
import { BlockedView } from "./BlockedView";
import { OtherView } from "./OtherView";
import { useFileCheck } from "./useFileCheck";
import { useFileSource, type FileRef } from "./useFileSource";

type Props = { visible: boolean; onClose: () => void; file: FileRef | null };

// Full-screen preview of an authenticated file or a local uri (TZ 29). Shows a
// download progress bar with cancel, then the right viewer for the format.
export function FilePreview({ visible, onClose, file }: Props) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const { state, uri, cls, kind, retry, cancel } = useFileSource(visible ? file : null);
  const check = useFileCheck(uri, cls);
  const title = state.name ?? file?.name ?? "";
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={[s.root, { backgroundColor: c.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
        <View style={s.head}>
          <IconButton icon="x" onPress={() => { cancel(); onClose(); }} />
          <Text variant="h4" numberOfLines={1} style={{ flex: 1 }}>{title}</Text>
          {uri && cls.safe && check !== "blocked" ? <IconButton icon="share" onPress={() => void shareFile(uri, file?.mime)} /> : null}
        </View>
        {!cls.safe || check === "blocked" ? (
          <BlockedView name={title} />
        ) : state.phase === "loading" ? (
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
        ) : uri && check === "large" ? (
          <OtherView uri={uri} name={title} mime={file?.mime} message={t("fnd1.preview.tooLarge")} />
        ) : uri ? <PreviewBody uri={uri} kind={kind} name={title} mime={file?.mime} /> : null}
      </View>
      {/* The page behind may be a dark hero with light icons: the preview has the theme's own background. */}
      {visible ? <StatusBar style={dark ? "light" : "dark"} /> : null}
      {visible ? <OverlayHost /> : null}
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
