import { useDemoTools } from "@/entities/access";
import { useSeedDemo } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { IconButton, confirmDialog, toast } from "@/shared/ui";

// Staging only (where the backend serves the demo routes): fill the platform with showcase records.
export function SeedDemoButton() {
  const { t } = useT();
  const on = useDemoTools();
  const seed = useSeedDemo();
  if (!on) return null;
  const run = () =>
    confirmDialog({
      title: t("admDashC.seed.confirmTitle"), message: t("admDashC.seed.confirmText"), confirmLabel: t("admDashC.seed.confirm"), cancelLabel: t("adm.cancel"), icon: "zap",
      onConfirm: async () => {
        const removed = await seed.mutateAsync();
        toast([t("admDashC.seed.ready"), removed > 0 ? t("admDashC.seed.removed", { n: removed }) : ""].filter(Boolean).join(" "), "ok");
      },
    });
  return <IconButton icon="zap" label={t("admDashC.seed.button")} onPress={seed.isPending ? undefined : run} />;
}
