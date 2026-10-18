import * as Clipboard from "expo-clipboard";
import { RowCard } from "@/shared/ui/admin";
import { Text, toast } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import type { TestOtp } from "../model/types";

// A staging OTP: phone and purpose on the left, the code (tap to copy) on the right.
export function OtpRow({ item }: { item: TestOtp }) {
  const { t, locale } = useT();
  const copy = () => {
    void Clipboard.setStringAsync(item.code).then(() => {
      successHaptic();
      toast(t("adm.copied"), "ok");
    });
  };
  return (
    <RowCard
      icon="key"
      tint="#64748B"
      title={item.phone}
      subtitle={humanizeSlug(item.purpose)}
      meta={fmtDateTime(item.createdAt, locale)}
      right={<Text variant="h3" weight="bold" style={{ letterSpacing: 3 }}>{item.code}</Text>}
      onPress={item.code ? copy : undefined}
    />
  );
}
