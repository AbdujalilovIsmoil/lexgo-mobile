import { useToggleDoc, type ConsentDoc } from "@/entities/admin-legal";
import { SwitchField } from "@/shared/ui/admin";
import { Button, confirmDialog } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";

// Per-version controls: switch it on / off (confirmed: it changes what users see) or fix its text in place.
export function DocVersionActions({ doc, onEdit }: { doc: ConsentDoc; onEdit: () => void }) {
  const { t } = useT();
  const toggle = useToggleDoc();
  const ask = (active: boolean) =>
    confirmDialog({
      title: active ? t("admLegalC.off.on") : t("admLegalC.off.title"), message: t(active ? "admLegalC.off.onText" : "admLegalC.off.text", { slug: doc.slug, version: doc.version }),
      confirmLabel: t("adm.confirm"), cancelLabel: t("adm.cancel"), icon: "shield", danger: !active, onConfirm: async () => { await toggle.mutateAsync({ id: doc.id, active }); },
    });
  return (
    <View style={{ gap: 10 }}>
      <SwitchField label={t("admLegal.activeNow")} value={doc.active} onChange={ask} />
      <Button title={t("admLegalB.editInPlace")} icon="edit-2" variant="soft" onPress={onEdit} />
    </View>
  );
}
