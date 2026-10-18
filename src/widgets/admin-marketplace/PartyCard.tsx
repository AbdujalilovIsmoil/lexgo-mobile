import { View } from "react-native";
import { Avatar, Button, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import type { MktPerson } from "@/entities/admin-marketplace";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

type Props = { role: string; person: MktPerson; type?: string; onOrders?: () => void };

// Client or seller of the order: identity, a call button and "all their orders".
export function PartyCard({ role, person: p, type, onOrders }: Props) {
  const { t } = useT();
  return (
    <SectionCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={p.name || p.phone || "?"} size={44} />
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="gray">{role}</Text>
          <Text variant="body" weight="bold" numberOfLines={1}>{p.name || "—"}</Text>
          <Text variant="caption" tone="gray2" numberOfLines={1}>{[type, p.lexgoId, p.phone].filter(Boolean).join(" · ")}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {p.phone ? <Button title={t("adm.call")} icon="phone" variant="soft" size="sm" onPress={() => openTel(p.phone)} /> : null}
        {onOrders ? <Button title={t("admMktC.theirOrders")} icon="list" variant="line" size="sm" onPress={onOrders} /> : null}
      </View>
    </SectionCard>
  );
}
