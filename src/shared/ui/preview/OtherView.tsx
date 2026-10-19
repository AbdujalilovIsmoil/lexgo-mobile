import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { openWith } from "./openWith";

// Formats the app cannot render itself: offer the system "open with" / share.
export function OtherView({ uri, name, mime, message }: { uri: string; name: string; mime?: string; message?: string }) {
  const { t } = useT();
  return (
    <View style={{ flex: 1, padding: 28, gap: 14, alignItems: "center", justifyContent: "center" }}>
      <Icon name="file" size={48} />
      <Text variant="h4" center numberOfLines={2}>{name}</Text>
      <Text tone="gray" center>{message ?? t("fnd1.preview.noPreview")}</Text>
      <Button title={t("fnd1.preview.openWith")} icon="external-link" onPress={() => void openWith(uri, mime)} />
    </View>
  );
}
