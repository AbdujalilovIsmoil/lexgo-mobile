import type { UrgentRequest } from "@/entities/admin-callcenter";
import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useCandidateSource } from "../model/useCandidateSource";
import { useGroupForm } from "../model/useGroupForm";
import { CandidateFilters } from "./CandidateFilters";
import { CandidateList } from "./CandidateList";
import { GroupExtras } from "./GroupExtras";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Group second opinion: choose exactly as many advocates as the client asked for, schedule, notify the client.
export function GroupSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useGroupForm(req, onClose);
  const src = useCandidateSource(req, visible);
  return (
    <FormSheet
      visible={visible} onClose={onClose} title={t(req.groupLawyers.length ? "admCc.regroup" : "admCc.assignGroup")} subtitle={t("admCcB.pickedOf", { n: f.ids.length, want: f.want })}
      onSubmit={() => void f.submit()} submitLabel={t("admCcB.assignSubmit")} submitting={f.pending} disabled={!f.ids.length} snaps={[0.85, 0.96]}
    >
      <Text variant="small" tone="gray">{t("admCc.candidatesLead", { n: f.want })}</Text>
      <CandidateFilters src={src} />
      <CandidateList src={src} ids={f.ids} full={f.full} onToggle={f.toggle} />
      <GroupExtras f={f} />
    </FormSheet>
  );
}
