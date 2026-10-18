import { useState } from "react";
import { View } from "react-native";
import { Chip, ErrorView, Skeleton, Text } from "@/shared/ui";
import { FormSheet, RowCard } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { serviceErrorOf, useServiceErrorText, usePromoPackages, useServiceWrites, type ManagedService, type PromoPackage, type PromoResult } from "@/entities/organization";

type Props = { visible: boolean; orgId: string; memberId: string; item: ManagedService | null; onClose: () => void };

// Service promotion: pick a package, send the request. It stays PENDING until ops confirm the payment.
export function PromoteSheet({ visible, orgId, memberId, item, onClose }: Props) {
  const { t } = useT();
  const errText = useServiceErrorText();
  const pk = usePromoPackages(visible);
  const { promote } = useServiceWrites(orgId, memberId);
  const [pick, setPick] = useState<PromoPackage | null>(null);
  const [done, setDone] = useState<PromoResult | null>(null);
  const [err, setErr] = useState("");
  useSheetReset(visible, () => { setPick(null); setDone(null); setErr(""); });
  const send = () => {
    if (!item || !pick) return;
    setErr("");
    promote.mutate({ id: item.id, pkg: pick }, { onSuccess: setDone, onError: (e) => setErr(errText(serviceErrorOf(e))) });
  };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("og7.title")} subtitle={item?.name} onSubmit={done ? onClose : send} submitLabel={done ? t("adm.close") : t("og7.send")} submitting={promote.isPending} disabled={!done && !pick}>
      {done ? (
        <View style={{ gap: 8 }}>
          <Text variant="h4">{done.telegramSent ? t("og7.doneTitle") : t("og7.failTitle")}</Text>
          <Text variant="small" tone="gray">{done.telegramSent ? t("og7.doneText") : t("og7.failText")}</Text>
        </View>
      ) : (
        <>
          <Text variant="small" tone="gray">{t("og7.lead")}</Text>
          {pk.isLoading ? <Skeleton height={70} round={16} /> : pk.isError ? <ErrorView error={pk.error} onRetry={() => void pk.refetch()} compact /> : (pk.data ?? []).map((p) => (
            <RowCard key={p.id} icon="zap" tint="#F59E0B" title={p.title} subtitle={t("og7.days", { d: p.days })} right={<Chip label={`${fmtMoney(p.price)} ${t("adm.currency")}`} active={pick?.id === p.id} onPress={() => setPick(p)} />} onPress={() => setPick(p)} />
          ))}
          {pk.isSuccess && !pk.data.length ? <Text variant="small" tone="gray" center>{t("og7.empty")}</Text> : null}
          <Text variant="caption" tone="gray2">{t("og7.note")}</Text>
          {err ? <Text variant="small" tone="err">{err}</Text> : null}
        </>
      )}
    </FormSheet>
  );
}
