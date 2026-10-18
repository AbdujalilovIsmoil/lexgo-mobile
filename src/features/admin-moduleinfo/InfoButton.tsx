import { useState } from "react";
import { useModuleInfo } from "@/entities/admin-moduleinfo";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { IconButton, Text } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";

// "About this module" (the backend's own description, e.g. GET /approvals/info) in a sheet opened from the header.
export function InfoButton({ path }: { path: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const q = useModuleInfo(path, open);
  const d = q.data;
  return (
    <>
      <IconButton icon="info" onPress={() => setOpen(true)} label={t("ag1.info.title")} />
      <FormSheet visible={open} onClose={() => setOpen(false)} title={d?.title || t("ag1.info.title")}>
        <QueryBoundary query={q}>
          {d ? (
            <View style={{ gap: 12 }}>
              {d.purpose ? <Text variant="body">{d.purpose}</Text> : null}
              {d.sections.map((s) => (
                <View key={s.key} style={{ gap: 4 }}>
                  <Text variant="small" weight="bold" tone="gray">{t(`ag1.info.${s.key}`)}</Text>
                  {s.lines.map((l, i) => <Text key={i} variant="small">• {l}</Text>)}
                </View>
              ))}
              {d.note ? <Text variant="caption" tone="gray2">{d.note}</Text> : null}
            </View>
          ) : null}
        </QueryBoundary>
      </FormSheet>
    </>
  );
}
