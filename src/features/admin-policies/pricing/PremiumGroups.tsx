import { View } from "react-native";
import { CLIENT_FIELDS, SELLER_FIELDS, type Issue, type Pricing } from "@/entities/admin-policies";
import { SwitchField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { NumField } from "../json/NumField";
import { useT } from "@/shared/i18n";
import { bad, Issues, under } from "./Issues";

type Props = { p: Pricing; issues: Issue[]; onChange: (p: Pricing) => void };
const Head = ({ k }: { k: string }) => {
  const { t } = useT();
  return <><Text variant="h4">{t(`admPolC.pr.${k}.title`)}</Text><Text variant="caption" tone="gray">{t(`admPolC.pr.${k}.hint`)}</Text></>;
};

// Premiums for strong specialists (results), highly rated by clients, and long experience in one sector.
export function PremiumGroups({ p, issues, onChange }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 12 }}>
      <Head k="seller" />
      {SELLER_FIELDS.map((f) => <NumField key={f} label={t(`admPolC.pr.seller.${f}`)} value={p.seller[f]} error={bad(issues, `seller.${f}`)} onChange={(v) => onChange({ ...p, seller: { ...p.seller, [f]: v } })} />)}
      <Issues items={under(issues, "seller")} />
      <Head k="client" />
      {CLIENT_FIELDS.map((f) => <NumField key={f} label={t(`admPolC.pr.client.${f}`)} value={p.client[f]} error={bad(issues, `client.${f}`)} onChange={(v) => onChange({ ...p, client: { ...p.client, [f]: v } })} />)}
      <Issues items={under(issues, "client")} />
      <Head k="sector" />
      <SwitchField label={t("admPolC.pr.sector.verifiedOnly")} value={p.sector.verifiedOnly} onChange={(v) => onChange({ ...p, sector: { ...p.sector, verifiedOnly: v } })} />
      <NumField label={t("admPolC.pr.sector.minYears")} value={p.sector.minYears} error={bad(issues, "sector.minYears")} onChange={(v) => onChange({ ...p, sector: { ...p.sector, minYears: v } })} />
      <NumField label={t("admPolC.pr.sector.percent")} value={p.sector.percent} error={bad(issues, "sector.percent")} onChange={(v) => onChange({ ...p, sector: { ...p.sector, percent: v } })} />
      <Issues items={under(issues, "sector")} />
    </View>
  );
}
