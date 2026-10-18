import { useState } from "react";
import { View } from "react-native";
import { FamilyRow, useFamily } from "@/entities/profile-extras";
import { FamilySheet, useFamilyActions } from "@/features/profile-extras";
import { EmptyState, Text } from "@/shared/ui";
import { AddRow, ProfileSection, RowsSkeleton } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// Web "Oila a'zolari" panel: add (sheet), per-member share toggle (PATCH shared_access), remove (DELETE).
export function FamilyPanel() {
  const { t } = useT();
  const q = useFamily();
  const act = useFamilyActions();
  const [add, setAdd] = useState(false);
  const rows = q.data ?? [];
  return (
    <ProfileSection accent="rose" icon="users" title={t("py6.title")} badge={q.data ? rows.length : undefined} action={{ icon: "plus", label: t("py6.add"), onPress: () => setAdd(true) }}>
      <Text variant="small" tone="gray">{t("py6.note")}</Text>
      {q.isLoading ? <RowsSkeleton /> : !rows.length ? <View style={{ gap: 12 }}><EmptyState compact icon="users" title={t("py6.empty")} /><AddRow accent="rose" label={t("py6.add")} onPress={() => setAdd(true)} /></View> : (
        <View style={{ gap: 10 }}>
          {rows.map((m) => (
            <FamilyRow key={m.id} item={m} onShare={() => act.share.mutate({ id: m.id, on: !m.sharedAccess })} onRemove={() => act.confirmRemove(m)} />
          ))}
          <AddRow accent="rose" label={t("py6.add")} onPress={() => setAdd(true)} />
        </View>
      )}
      <FamilySheet visible={add} member={null} others={rows} onClose={() => setAdd(false)} />
    </ProfileSection>
  );
}
