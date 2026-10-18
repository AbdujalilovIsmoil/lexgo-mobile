import { StyleSheet, View } from "react-native";
import type { User } from "@/entities/session";
import { Avatar, Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { maskPhone } from "@/shared/lib/phone";

type Props = { user: User; photo?: string; role: string };

// Under the cover: the avatar sits on the cover's lower edge with a ring in the page colour; name, phone
// and the role / LexGo ID chips are left-aligned beneath it.
export function ProfileIdentity({ user, photo, role }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.wrap}>
      <View style={[s.ring, { backgroundColor: c.bg }]}><Avatar name={user.name || user.phone} uri={photo || undefined} size={92} /></View>
      <Text variant="h2" numberOfLines={1} style={s.name}>{user.name || maskPhone(user.phone)}</Text>
      <View style={s.phone}><Icon name="phone" size={14} tone="gray" /><Text variant="small" tone="gray">{user.phone}</Text></View>
      <View style={s.pills}>
        <Pill label={t(role)} tone="blue" icon="user" small />
        {user.lexgoId ? <Pill label={`${t("profile.lexgoId")} ${user.lexgoId}`} tone="gray" small /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: -46, gap: 4 },
  ring: { alignSelf: "flex-start", padding: 5, borderRadius: 56 },
  name: { marginTop: 4 },
  phone: { flexDirection: "row", alignItems: "center", gap: 6 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
});
