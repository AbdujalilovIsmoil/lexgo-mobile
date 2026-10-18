import { StyleSheet, View } from "react-native";
import { Button, Segmented, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useServiceWrites, type ManagedService, type ServiceStatus } from "@/entities/organization";

type Props = { orgId: string; memberId: string; item: ManagedService; onEdit: () => void; onPromote: () => void };
const STATUSES: ServiceStatus[] = ["active", "paused", "inactive"];

// Status switch + edit / promote / remove of one member service (all writes refetch the list).
export function ServiceActions({ orgId, memberId, item, onEdit, onPromote }: Props) {
  const { t } = useT();
  const w = useServiceWrites(orgId, memberId);
  const busy = w.status.isPending || w.remove.isPending;
  const shown = w.status.isPending && w.status.variables?.id === item.id ? w.status.variables.status : item.status;
  const canPromote = item.status === "active" && item.catalogActive && !item.promotedDays && !item.promoRequest;
  const remove = () =>
    confirmDialog({
      title: t("og5.removeTitle"), message: t("og5.removeText", { title: item.name }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true,
      onConfirm: async () => { await w.remove.mutateAsync(item.id); },
    });
  return (
    <View style={s.col}>
      <Segmented options={STATUSES.map((v) => ({ value: v, label: t(`og5.status.${v}`) }))} value={shown} onChange={(v) => !busy && v !== item.status && w.status.mutate({ id: item.id, status: v })} />
      <View style={s.row}>
        <Button title={t("adm.edit")} icon="edit-2" variant="line" size="sm" onPress={onEdit} disabled={!item.catalogActive || busy} style={s.grow} />
        <Button title={t("og5.promote")} icon="zap" variant="soft" size="sm" onPress={onPromote} disabled={!canPromote || busy} style={s.grow} />
        <Button title="" icon="trash-2" variant="line" size="sm" onPress={remove} loading={w.remove.isPending} disabled={busy} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10, marginTop: 4 }, row: { flexDirection: "row", gap: 8, alignItems: "center" }, grow: { flex: 1 } });
