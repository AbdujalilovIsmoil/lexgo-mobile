import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { DocAnalysis } from "@/entities/doc-analysis";
import { fmtMoney } from "@/shared/lib/money";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { useDocAnalysis } from "../model/useDocAnalysis";
import { Rows } from "./QuotePanel";

// Permanent offer after an AI analysis: advocate review price, "add the review" (re-quotes) and the advocate list.
export function UpsellCard({ result, d }: { result: DocAnalysis; d: ReturnType<typeof useDocAnalysis> }) {
  const { t } = useT();
  const router = useRouter();
  const up = result.upsell;
  if (!up) return null;
  const fresh = d.quote.fresh;
  const price = fresh?.lawyerReviewAmount;
  return (
    <Card tinted style={s.card}>
      <View style={s.head}>
        <Icon name="shield" size={20} tone="accent" />
        <Text variant="h4" style={s.flex}>{up.title || t("cxDa.upsellTitle")}</Text>
      </View>
      <Text variant="small" tone="gray">{up.reason || t("cxDa.upsellText")}</Text>
      {price ? <Text variant="small" weight="bold" tone="accent">{t("cxDa.upsellPrice", { price: `${fmtMoney(price)} ${t("cxDa.som")}` })}</Text> : null}
      {d.opts.lawyerReview && fresh ? <Rows q={fresh} pages={fresh.pageCount || result.pageCount} /> : null}
      {d.opts.lawyerReview ? null : <Button title={t("cxDa.upsellAdd")} size="sm" full onPress={d.addReview} />}
      <Button title={t("cxDa.upsellLawyers")} variant="line" size="sm" icon="arrow-right" iconRight full onPress={() => router.push("/lawyers")} />
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 10 }, head: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 } });
