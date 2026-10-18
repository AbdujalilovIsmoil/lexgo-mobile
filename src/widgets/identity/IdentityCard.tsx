import { View } from "react-native";
import { isIdentityPending, useIdentity } from "@/entities/identity";
import { useIdentityFlow } from "@/features/identity-verify";
import { Button, Skeleton, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { IdentityCode } from "./IdentityCode";
import { IdentityProviders } from "./IdentityProviders";

// "Shaxsni tasdiqlash" panel of the profile (web IdentityVerify): verified / code step / pending / providers.
export function IdentityCard() {
  const c = useColors();
  const { t } = useT();
  const q = useIdentity();
  const f = useIdentityFlow();
  const cur = q.data;
  const providers = <IdentityProviders disabled={f.busy} wait={f.wait} note={f.note} onStart={(p) => void f.start(p)} />;
  return (
    <ProfileSection accent="green" icon="check-circle" title={t("cpr.idTitle")}>
      <Text variant="small" tone="gray">{t("cpr.idLead")}</Text>
      {q.isLoading ? <Skeleton height={60} round={14} /> : cur?.verified ? (
        <View style={{ gap: 2, padding: 14, borderRadius: 16, backgroundColor: c.okBg }}>
          <Text variant="body" weight="bold" tone="ok">{t("cpr.idVerified")}</Text>
          {cur.fullName ? <Text variant="small" tone="gray">{cur.fullName}{cur.pinfl ? ` · ${cur.pinfl}` : ""}</Text> : null}
        </View>
      ) : f.flow ? (
        <IdentityCode provider={f.flow.provider} busy={f.busy} wait={f.wait} note={f.note} onVerify={(code) => void f.verify(code)} onCancel={f.cancel} />
      ) : (
        <>
          {isIdentityPending(cur) ? (
            <View style={{ gap: 8, alignItems: "flex-start" }}>
              <Text variant="small" tone="gray">{t("cpr.idPending")}</Text>
              <Button title={t("cpr.idRefresh")} variant="line" size="sm" onPress={() => void f.refresh()} />
            </View>
          ) : null}
          {providers}
        </>
      )}
    </ProfileSection>
  );
}
