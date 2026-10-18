import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useAccess } from "@/entities/access";
import { visibleExports, type ExportDef } from "@/entities/admin-export";
import { ExportSheet } from "@/features/admin-export";
import { AdminPage, RowCard } from "@/shared/ui/admin";
import { EmptyState, Icon } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Excel export centre: every workbook this user may download (permission-first), each with its own period / filter.
export default function AdminExportsPage() {
  const { t } = useT();
  const insets = useInsets();
  const list = visibleExports(useAccess());
  const [open, setOpen] = useState<ExportDef | null>(null);
  return (
    <AdminPage title={t("admHub.mod.exports.title")} subtitle={t("ag2.count", { n: list.length })}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((d) => (
              <RowCard key={d.key} icon={d.icon} title={t(`ag2.exp.${d.key}`)} subtitle={d.dates ? t("ag2.withPeriod") : t("ag2.noPeriod")} onPress={() => setOpen(d)} right={<Icon name="download" size={20} tone="accent" />} />
            ))}
          </View>
        ) : <EmptyState icon="lock" title={t("ag2.none")} />}
      </ScrollView>
      <ExportSheet def={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
