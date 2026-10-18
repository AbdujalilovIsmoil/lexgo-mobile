import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { clearCachedData } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { clearFileCache } from "@/shared/lib/download";
import { successHaptic } from "@/shared/lib/haptics";
import { Button, confirmDialog, Text, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { storageKey } from "./useStorageInfo";

// Free space: saved screens and drafts, or the downloaded documents. Both are only copies — the
// data on the server is untouched and loads again on demand.
export function ClearCard() {
  const { t } = useT();
  const qc = useQueryClient();
  const done = (key: string) => {
    successHaptic();
    toast(t(key), "ok");
    void qc.invalidateQueries({ queryKey: storageKey });
  };
  const ask = (key: "cache" | "files", run: () => void | Promise<void>) =>
    confirmDialog({
      title: t(`nt3.clear.${key}.title`),
      message: t(`nt3.clear.${key}.text`),
      confirmLabel: t("nt3.clear.confirm"),
      cancelLabel: t("common.cancel"),
      icon: "trash-2",
      danger: true,
      onConfirm: async () => {
        await run();
        done(`nt3.clear.${key}.done`);
      },
    });
  return (
    <SectionCard title={t("nt3.clearTitle")}>
      <Text variant="small" tone="gray">{t("nt3.clearText")}</Text>
      <View style={{ gap: 10 }}>
        <Button title={t("nt3.clear.cache.button")} icon="database" variant="soft" full onPress={() => ask("cache", async () => { await clearCachedData(); qc.removeQueries({ queryKey: ["notifications"] }); })} />
        <Button title={t("nt3.clear.files.button")} icon="file" variant="soft" full onPress={() => ask("files", clearFileCache)} />
      </View>
    </SectionCard>
  );
}
