import { View } from "react-native";
import { SERVICE_STATUSES, hiddenReasons, useRemoveService, useServiceStatus, type ProService, type ServiceScope, type ServiceStatus } from "@/entities/pro-service";
import { Button, Segmented, Pill, confirmDialog } from "@/shared/ui";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useKept } from "@/shared/lib/useKept";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { item: ProService | null; verified: boolean; scope?: ServiceScope; onClose: () => void; onEdit: (s: ProService) => void; onPromote: (s: ProService) => void };

// One service in detail: price and corridor, why it is (not) listed, status switch, edit / promote / remove.
export function ServiceSheet({ item: current, verified, scope, onClose, onEdit, onPromote }: Props) {
  const { t } = useT();
  const som = useSom();
  const item = useKept(current);
  const status = useServiceStatus(scope);
  const remove = useRemoveService(scope);
  const why = item ? hiddenReasons(item, verified) : [];
  const ask = () =>
    item &&
    confirmDialog({
      title: t("sl6.removeTitle"),
      message: t("sl6.removeText", { name: item.name }),
      confirmLabel: t("adm.delete"),
      cancelLabel: t("adm.cancel"),
      icon: "trash-2",
      danger: true,
      onConfirm: async () => {
        await remove.mutateAsync(item.id).catch(() => undefined);
        onClose();
      },
    });
  return (
    <FormSheet visible={!!current} onClose={onClose} title={item?.name ?? ""} subtitle={[item?.categoryTitle, item?.subcategory].filter(Boolean).join(" · ")} onSubmit={() => item && onEdit(item)} submitLabel={t("adm.edit")} snaps={[0.7, 0.94]}>
      {item ? (
        <>
          <Segmented<ServiceStatus> options={SERVICE_STATUSES.map((s) => ({ value: s, label: t(`sl6.status.${s}`) }))} value={item.status} onChange={(s) => status.mutate({ id: item.id, status: s })} />
          <FactRows rows={[
            { label: t("sl6.f.price"), value: item.effectivePrice ? som(item.effectivePrice) : t("sl6.noPrice") },
            { label: t("sl6.f.catalog"), value: item.catalogPrice ? som(item.catalogPrice) : undefined },
            { label: t("sl6.f.corridor"), value: item.limits ? `${som(item.limits.min)} – ${som(item.limits.max)}` : undefined },
            { label: t("sl6.f.listed"), value: <Pill label={t(item.visible ? "sl6.yes" : "sl6.no")} tone={item.visible ? "ok" : "warn"} small /> },
            { label: t("sl6.f.promo"), value: item.promotion ? t("sl6.promoted", { n: item.promotion.daysLeft }) : undefined },
            { label: t("sl6.f.note"), value: item.note },
          ]} />
          {why.map((r) => <Notice key={r} tone="warn" text={t(`sl6.why.${r}`)} />)}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title={t("sl6.promote")} icon="radio" variant="soft" size="sm" disabled={item.status !== "active"} onPress={() => onPromote(item)} />
            <Button title={t("adm.delete")} icon="trash-2" variant="line" size="sm" loading={remove.isPending} onPress={ask} />
          </View>
        </>
      ) : null}
    </FormSheet>
  );
}
