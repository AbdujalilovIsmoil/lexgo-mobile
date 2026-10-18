import { View } from "react-native";
import type { PkgComponent, PkgKind } from "@/entities/admin-packages";
import { SelectField } from "@/shared/ui/admin";
import { Card, IconButton, Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const KINDS: PkgKind[] = ["mandatory", "optional", "choose_one"];
const num = (s: string) => Number(s.replace(/\D/g, "")) || 0;

// One service inside a package: what the client pays for it, what the seller earns, how it is included.
export function ComponentCard({ c, name, onChange, onRemove }: { c: PkgComponent; name: string; onChange: (c: PkgComponent) => void; onRemove: () => void }) {
  const { t } = useT();
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="body" weight="bold" numberOfLines={2} style={{ flex: 1 }}>{name}</Text>
        <IconButton icon="trash-2" size={36} onPress={onRemove} label={t("adm.delete")} />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Input label={t("ag5.clientPrice")} value={c.clientPrice ? String(c.clientPrice) : ""} onChangeText={(x) => onChange({ ...c, clientPrice: num(x) })} keyboardType="number-pad" /></View>
        <View style={{ flex: 1 }}><Input label={t("ag5.sellerFee")} value={c.sellerFee ? String(c.sellerFee) : ""} onChangeText={(x) => onChange({ ...c, sellerFee: num(x) })} keyboardType="number-pad" /></View>
      </View>
      <SelectField label={t("ag5.kind")} value={c.kind} onChange={(kind) => onChange({ ...c, kind })} options={KINDS.map((k) => ({ value: k, label: t(`ag5.kinds.${k}`) }))} />
    </Card>
  );
}
