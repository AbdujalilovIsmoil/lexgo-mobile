import { View } from "react-native";
import { BottomSheet, Button, SheetScroll, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DutyCtor } from "@/entities/duty-request";

type Props = { ctor: DutyCtor | null; onYes: () => void; onNo: () => void; onClose: () => void };

// README §12 — "Your work went to the duty advocate. Will you also fill the document in yourself?" Shown once after the send, with the
// backend's own title and message (defaults when it sent none). Yes opens the constructor on the SAME request; No follows the request.
export function CtorPrompt({ ctor, onYes, onNo, onClose }: Props) {
  const { t } = useT();
  return (
    <BottomSheet visible={!!ctor} onClose={onClose} title={ctor?.title || t("dcl.ctorTitle")} snaps={[0.42]}>
      <SheetScroll>
        <Text variant="small" tone="gray">{ctor?.message || t("dcl.ctorText")}</Text>
        <View style={{ gap: 8 }}>
          <Button title={t("dcl.ctorYes")} icon="edit-3" variant="gradient" full onPress={onYes} />
          <Button title={t("dcl.ctorNo")} variant="soft" full onPress={onNo} />
        </View>
      </SheetScroll>
    </BottomSheet>
  );
}
