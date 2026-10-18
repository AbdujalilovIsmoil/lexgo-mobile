import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

export const URGENT_KINDS = ["video_consultation", "express_video_consultation", "traffic_accident_consultation", "chat_consultation", "second_opinion_single", "second_opinion_group"];
type Props = { visible: boolean; onClose: () => void; kind: string; channel: string; onKind: (v: string) => void; onChannel: (v: string) => void };

// Service kind and channel narrow the urgent pool on the server.
export function UrgentFilterSheet({ visible, onClose, kind, channel, onKind, onChannel }: Props) {
  const { t } = useT();
  const reset = () => { onKind(""); onChannel(""); onClose(); };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} onSubmit={onClose} submitLabel={t("adm.apply")} secondary={{ label: t("adm.reset"), onPress: reset }} snaps={[0.6, 0.9]}>
      <SelectField label={t("admCc.fKind")} value={kind} onChange={onKind} options={[{ value: "", label: t("admCc.allKinds") }, ...URGENT_KINDS.map((k) => ({ value: k, label: t(`admCc.kind.${k}`) }))]} />
      <SelectField label={t("admCc.fChannel")} value={channel} onChange={onChannel} options={[{ value: "", label: t("adm.all") }, { value: "video", label: t("admCc.ch.video") }, { value: "chat", label: t("admCc.ch.chat") }]} />
    </FormSheet>
  );
}
