import { useState } from "react";
import { View } from "react-native";
import { MethodRow, useMethods } from "@/entities/profile-extras";
import { MethodSheet, useMethodActions } from "@/features/profile-extras";
import { EmptyState, Skeleton } from "@/shared/ui";
import { AddRow, ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// Web "To'lov usullari" panel: saved cards drawn as mini bank cards, add card (sheet) and remove.
export function CardsPanel() {
  const { t } = useT();
  const q = useMethods();
  const act = useMethodActions();
  const [add, setAdd] = useState(false);
  const rows = q.data ?? [];
  return (
    <ProfileSection accent="indigo" icon="credit-card" title={t("py6.card.title")} badge={q.data ? rows.length : undefined} action={{ icon: "plus", label: t("py6.card.add"), onPress: () => setAdd(true) }}>
      {q.isLoading ? <Skeleton height={150} round={18} /> : !rows.length ? <View style={{ gap: 12 }}><EmptyState compact icon="credit-card" title={t("py6.card.empty")} /><AddRow accent="indigo" label={t("py6.card.add")} onPress={() => setAdd(true)} /></View> : (
        <View style={{ gap: 12 }}>{rows.map((m) => <MethodRow key={m.id} item={m} onRemove={() => act.confirmRemove(m)} />)}<AddRow accent="indigo" label={t("py6.card.add")} onPress={() => setAdd(true)} /></View>
      )}
      <MethodSheet visible={add} onClose={() => setAdd(false)} />
    </ProfileSection>
  );
}
