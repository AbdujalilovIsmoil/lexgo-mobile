import { useRouter } from "expo-router";
import type { SharedMember } from "@/entities/plan";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Family members who may use the plan (shared_family_members); managed on the family screen.
export function SharedMembers({ items }: { items: SharedMember[] }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <SectionCard title={t("py4.shared.title")}>
      {items.length ? items.map((m) => <RowCard key={m.id} avatar={m.name || m.phone} title={m.name || m.phone} subtitle={[m.phone, m.relation].filter(Boolean).join(" · ")} />) : <Text variant="small" tone="gray">{t("py4.shared.none")}</Text>}
      <Button title={t("py4.shared.manage")} variant="soft" size="sm" icon="users" onPress={() => router.push("/profile/family")} />
    </SectionCard>
  );
}
