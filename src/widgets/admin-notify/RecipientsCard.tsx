import { useState } from "react";
import { View } from "react-native";
import type { UserHit } from "@/entities/admin-users";
import { RecipientSheet } from "@/features/admin-notify";
import { SectionCard } from "@/shared/ui/admin";
import { Button, Chip, Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { selected: UserHit[]; onChange: (list: UserHit[]) => void; manualId: string; onManualId: (v: string) => void };

// Individual mode: the people picked so far (tap to remove), the picker sheet, and a manual id field.
export function RecipientsCard({ selected, onChange, manualId, onManualId }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <SectionCard title={t("admNtfB.recipients")}>
      <Text variant="small" tone="gray">{t("admNtfB.hint")}</Text>
      {selected.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {selected.map((u) => <Chip key={u.id} label={`${u.name || u.phone}  ✕`} active onPress={() => onChange(selected.filter((x) => x.id !== u.id))} />)}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Button title={t("admNtfB.add")} icon="user-plus" variant="soft" size="sm" onPress={() => setOpen(true)} />
        <Text variant="small" weight="bold">{t("admNtfB.selectedN", { n: selected.length })}</Text>
      </View>
      <Input label={t("admNtfB.manualId")} value={manualId} onChangeText={onManualId} placeholder={t("admNtfB.manualPh")} autoCapitalize="none" autoCorrect={false} />
      <RecipientSheet visible={open} onClose={() => setOpen(false)} selected={selected} onChange={onChange} />
    </SectionCard>
  );
}
