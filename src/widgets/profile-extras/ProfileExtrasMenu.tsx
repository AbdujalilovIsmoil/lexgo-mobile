import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useEntitlements } from "@/entities/plan";
import { Card, Divider, ListRow, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Item = { icon: "edit-3" | "file-text" | "layers" | "users" | "credit-card" | "check-square" | "share-2" | "gift" | "message-square" | "shield" | "lock"; key: string; href: string };
const ITEMS: Item[] = [
  { icon: "edit-3", key: "edit", href: "/profile/edit" },
  { icon: "file-text", key: "payments", href: "/payments" },
  { icon: "layers", key: "plan", href: "/entitlements" },
  { icon: "users", key: "family", href: "/profile/family" },
  { icon: "credit-card", key: "methods", href: "/profile/methods" },
  { icon: "check-square", key: "consents", href: "/profile/consents" },
  { icon: "share-2", key: "referral", href: "/profile/referral" },
  { icon: "gift", key: "gifts", href: "/profile/gifts" },
  { icon: "lock", key: "security", href: "/security" },
  { icon: "message-square", key: "complaints", href: "/complaints" },
  { icon: "shield", key: "warranty", href: "/warranty" },
];

// Entry points of the client profile extras: personal data, payments and plan, family and cards,
// consents, referral, gifts, complaints and the warranty.
export function ProfileExtrasMenu() {
  const { t } = useT();
  const router = useRouter();
  const pending = useEntitlements().data?.pendingRequests ?? 0;
  return (
    <View style={s.wrap}>
      <Text variant="kicker" tone="gray2" style={s.kick}>{t("py9.section").toUpperCase()}</Text>
      <Card padded={false} style={s.card}>
        {ITEMS.map((it, i) => (
          <View key={it.key}>
            {i ? <Divider inset={66} /> : null}
            <ListRow icon={it.icon} title={t(it.key === "security" ? "cpr.secTitle" : `py9.menu.${it.key}`)} sub={t(it.key === "security" ? "cpr.secSub" : `py9.menu.${it.key}Sub`)} onPress={() => router.push(it.href as never)} right={it.key === "plan" && pending ? <Pill label={String(pending)} tone="warn" small /> : undefined} />
          </View>
        ))}
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 20 },
  kick: { marginBottom: 8, marginLeft: 4 },
  card: { paddingHorizontal: 16 },
});
