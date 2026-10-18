import { FormSheet, SelectField } from "@/shared/ui/admin";
import { KINDS, useUrgentLabels } from "@/entities/urgent";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; kind: string; channel: string; onKind: (v: string) => void; onChannel: (v: string) => void };

// Service kind and channel narrow the pool on the server.
export function CcFilterSheet({ visible, onClose, kind, channel, onKind, onChannel }: Props) {
  const { t } = useT();
  const label = useUrgentLabels();
  const reset = () => { onKind(""); onChannel(""); onClose(); };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} onSubmit={onClose} submitLabel={t("adm.apply")} secondary={{ label: t("adm.reset"), onPress: reset }} snaps={[0.6, 0.9]}>
      <SelectField label={t("ug6.fKind")} value={kind} onChange={onKind} options={[{ value: "", label: t("ug6.allKinds") }, ...KINDS.map((k) => ({ value: k, label: label.kind(k) }))]} />
      <SelectField label={t("ug6.fChannel")} value={channel} onChange={onChannel} options={[{ value: "", label: t("adm.all") }, { value: "video", label: t("ug4.ch.video") }, { value: "chat", label: t("ug4.ch.chat") }]} />
    </FormSheet>
  );
}
