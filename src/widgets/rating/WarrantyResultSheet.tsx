import { View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { tOr } from "@/shared/lib/pay/tOr";
import { useKept } from "@/shared/lib";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { WarrantyClaim } from "@/entities/rating";

// The result alert after a request: the claim's real status and what happens next (web: .wres modal).
export function WarrantyResultSheet({ claim, onClose }: { claim: WarrantyClaim | null; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const k = useKept(claim);
  return (
    <FormSheet visible={!!claim} onClose={onClose} title={t("pwr.wr.resultTitle")} onSubmit={onClose} submitLabel={t("pwr.wr.resultClose")} snaps={[0.5]}>
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <Icon name="check-circle" size={44} color={c.ok} />
        <Text variant="h4" center>{t("pwr.wr.resultSentTitle")}</Text>
        <Text variant="small" weight="bold" tone="accent" center>{t("pwr.wr.resultStatus", { status: k ? tOr(t, "py10.w.status", k.status) : "" })}</Text>
        <Text variant="small" tone="gray" center>{t("pwr.wr.resultNote")}</Text>
      </View>
    </FormSheet>
  );
}
