import { View } from "react-native";
import { useRouter } from "expo-router";
import { statusLabel } from "@/entities/payment";
import { useIdentity } from "@/entities/identity";
import { useMethods, useClientProfile } from "@/entities/profile-extras";
import { useSession } from "@/entities/session";
import { Button, Card, Divider, Pill, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6 }}>
      <Text variant="small" tone="gray">{label}</Text>
      <Text variant="small" weight="bold" style={{ flexShrink: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

// "Shaxsiy ma'lumotlar" (web profile, first panel): ID, name, phone, e-mail, card, plan + edit button.
export function ProfileSummary() {
  const { t } = useT();
  const router = useRouter();
  const user = useSession()?.user;
  const q = useClientProfile();
  const card = useMethods().data?.[0];
  const verified = useIdentity().data?.verified;
  const p = q.data;
  const unset = t("cpr.notSet");
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      <Card style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Text variant="h4" style={{ flex: 1 }}>{t("cpr.personal")}</Text>
          {verified ? <Pill label={t("cpr.verifiedProfile")} tone="ok" icon="shield" small /> : null}
          <Button title={t("py9.edit")} icon="edit-3" variant="soft" size="sm" onPress={() => router.push("/profile/edit")} />
        </View>
        {q.isLoading ? <Skeleton height={120} round={14} /> : (
          <>
            {user?.lexgoId ? <Fact label={t("cpr.myId")} value={user.lexgoId} /> : null}
            <Fact label={t("cpr.name")} value={p?.name || user?.name || "—"} />
            <Fact label={t("cpr.phone")} value={p?.phone || user?.phone || "—"} />
            <Fact label={t("cpr.email")} value={p?.email || unset} />
            <Fact label={t("cpr.card")} value={card ? `•••• ${card.last4}` : unset} />
            <Divider vertical={6} />
            <Fact label={t("cpr.subscription")} value={p?.planName ? `${p.planName}${p.planStatus ? ` · ${statusLabel(p.planStatus, t)}` : ""}` : t("cpr.subActive")} />
          </>
        )}
      </Card>
    </View>
  );
}
