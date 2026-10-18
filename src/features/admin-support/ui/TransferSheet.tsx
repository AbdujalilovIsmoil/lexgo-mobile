import { useState } from "react";
import { View } from "react-native";
import { PickRow, useOperatorSearch, useSupportLabels, useTransfer, type SupportOperator, type SupportTicket } from "@/entities/admin-support";
import { useSession } from "@/entities/session";
import { FormSheet } from "@/shared/ui/admin";
import { Icon, Input, Skeleton, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { supportTransferSchema } from "../model/supportSchemas";

type Props = { ticket: SupportTicket | null; visible: boolean; onClose: () => void };

// Hand the ticket to another operator: search, pick, and say why (the reason is required).
export function TransferSheet({ ticket, visible, onClose }: Props) {
  const { t } = useT();
  const labels = useSupportLabels();
  const me = useSession()?.user.id ?? "";
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<SupportOperator | null>(null);
  const f = useAppForm(supportTransferSchema, { reason: "" });
  const ops = useOperatorSearch(useDebounced(q, 300), visible);
  const close = () => { setQ(""); setPick(null); f.reset(); onClose(); };
  const transfer = useTransfer(close);
  const list = (ops.data ?? []).filter((o) => o.id !== me);
  const submit = f.handleSubmit((v) => { if (ticket && pick) transfer.mutate({ id: ticket.id, operatorId: pick.id, reason: v.reason }); });
  return (
    <FormSheet visible={visible} onClose={close} title={t("admSup.transfer")} onSubmit={() => void submit()} submitLabel={t("admSup.transferDo")} submitting={transfer.isPending} disabled={!pick} snaps={[0.8, 0.94]}>
      <Input value={q} onChangeText={setQ} placeholder={t("admSup.operatorSearch")} autoCapitalize="none" autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} />
      <View style={{ gap: 8 }}>
        {ops.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={56} round={14} />) : null}
        {list.map((o) => <PickRow key={o.id} title={o.name || o.lexgoId} hint={[labels.role(o.role), o.lexgoId].filter(Boolean).join(" · ")} selected={pick?.id === o.id} onPress={() => setPick(o)} />)}
        {!ops.isLoading && !list.length ? <Text variant="small" tone="gray" center>{t("admSup.operatorNone")}</Text> : null}
      </View>
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("admSup.reasonPh")} multiline />
    </FormSheet>
  );
}
