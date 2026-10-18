import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Icon, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { useDashboard } from "@/entities/organization";
import { useCurrentOrg } from "@/features/org-switch";

// Entry to the owner area for the workspace: the organization with its member and active-work counts
// (renders nothing for accounts that are not organization owners).
export function OrgEntryCard() {
  const { orgOwner } = useAccess();
  return orgOwner ? <Entry /> : null;
}

function Entry() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const { query, current } = useCurrentOrg();
  const dash = useDashboard(current?.id ?? "");
  const s = dash.data?.summary;
  const works = s ? s.orders + s.cases + s.urgent : 0;
  return (
    <Card onPress={() => router.push("/org" as never)} style={s2.card}>
      <View style={[s2.icon, { backgroundColor: c.tint2 }]}><Icon name="briefcase" size={22} color={c.accent} /></View>
      <View style={s2.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{current?.name ?? t("og1.title")}</Text>
        {query.isLoading || (current && dash.isLoading) ? <Skeleton height={14} width="60%" /> : (
          <Text variant="small" tone="gray" numberOfLines={2}>{current ? t("og1.entrySummary", { m: s?.members ?? 0, w: works }) : t("og1.entryEmpty")}</Text>
        )}
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </Card>
  );
}

const s2 = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
