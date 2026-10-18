import { View } from "react-native";
import { useToday } from "@/entities/admin-hrm";
import { useSession } from "@/entities/session";
import { Avatar, Card, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Greeting card of the workday: avatar, "Hello, name!" and today's date.
export function DashHello() {
  const { t, locale } = useT();
  const d = useToday().data;
  const me = useSession()?.user.name;
  const full = d?.name || me || "";
  const first = full.split(" ")[0];
  return (
    <Card tinted style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Avatar name={full || "?"} size={52} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="kicker" tone="gray">{t("admHrm.kicker").toUpperCase()}</Text>
        <Text variant="h3" numberOfLines={1}>{first ? t("admHrm.hello", { name: first }) : t("admHrm.kicker")}</Text>
        <Text variant="small" tone="gray">{fmtDate(d?.date, locale)}</Text>
      </View>
    </Card>
  );
}
