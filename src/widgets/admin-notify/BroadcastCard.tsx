import { BROADCAST_ROLES } from "@/entities/admin-notify";
import { SectionCard, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Broadcast mode: one role; the server fans the notification out to everyone in it.
export function BroadcastCard({ role, onChange }: { role: string; onChange: (r: string) => void }) {
  const { t } = useT();
  return (
    <SectionCard title={t("admNtfB.broadcastRole")}>
      <Text variant="small" tone="gray">{t("admNtfB.broadcastHint")}</Text>
      <SelectField value={role} options={BROADCAST_ROLES.map((r) => ({ value: r, label: t(`admNtf.roles.${r}`) }))} onChange={onChange} />
    </SectionCard>
  );
}
