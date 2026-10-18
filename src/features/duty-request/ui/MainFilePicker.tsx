import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { pickDocuments } from "@/shared/lib/upload";
import { checkAttach, FILE_EXT_LIST, LIMITS, type Attach } from "@/entities/duty-request";

type Props = { file: Attach | null; onPick: (f: Attach) => void; error: boolean };

// The client's own document that the advocate should check (existing-document review).
export function MainFilePicker({ file, onPick, error }: Props) {
  const { t } = useT();
  const c = useColors();
  const pick = async () => {
    const out = await pickDocuments({ maxMb: LIMITS.fileMb });
    const f = out?.files[0];
    if (!out) return;
    const bad = out.error ?? (f ? checkAttach(f, "file") : null);
    if (bad) toast(t(`dm8.err.${bad}`, { mb: LIMITS.fileMb, types: FILE_EXT_LIST, n: LIMITS.maxFiles }), "err");
    else if (f) onPick(f);
  };
  return (
    <Card onPress={() => void pick()} style={[s.card, error && { borderColor: c.err, borderWidth: 2 }]}>
      <Icon name={file ? "file-text" : "upload"} size={22} color={error ? c.err : c.accent} />
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="bold" numberOfLines={1}>{file ? file.name : t("dm8.mainPick")}</Text>
        <Text variant="caption" tone={error ? "err" : "gray"}>{error ? t("dm8.mainRequired") : file ? t("dm8.mainChange") : t("dm8.mainHint", { mb: LIMITS.fileMb, types: FILE_EXT_LIST })}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({ card: { flexDirection: "row", alignItems: "center", gap: 12 } });
