import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { Picked } from "../model/useRecipients";
import { ClientPickSheet } from "./ClientPickSheet";

type Props = { picked: Picked[]; onToggle: (c: Picked) => void; onRemove: (id: string) => void };

// Who gets the notification: chips of the chosen clients (tap to remove) and the picker.
export function RecipientsCard({ picked, onToggle, onRemove }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <SectionCard title={t("admNtfB.recipients")}>
      <Text variant="small" tone="gray">{t("cc3.hint")}</Text>
      {picked.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {picked.map((p) => <Chip key={p.id} label={`${p.name}  ✕`} active onPress={() => onRemove(p.id)} />)}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Button title={t("admNtfB.add")} icon="user-plus" variant="soft" size="sm" onPress={() => setOpen(true)} />
        <Text variant="small" weight="bold">{t("admNtfB.selectedN", { n: picked.length })}</Text>
      </View>
      <ClientPickSheet visible={open} onClose={() => setOpen(false)} picked={picked} onToggle={onToggle} />
    </SectionCard>
  );
}
