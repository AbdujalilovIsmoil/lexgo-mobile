import { useState } from "react";
import { View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { previewTemplate, type Preview } from "@/entities/admin-templates";
import { Button, Text, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { FieldList } from "./FieldList";

// "Check fields": the backend parses the {{placeholders}} of the text being edited and lists the fields it will ask the client for.
export function PlaceholderPreview({ text }: { text: string }) {
  const { t } = useT();
  const [res, setRes] = useState<Preview | null>(null);
  const run = useMutation({ mutationFn: () => previewTemplate({ templateText: text }), onSuccess: setRes, onError: () => toast(t("adm.actionFailed"), "err") });
  return (
    <View style={{ gap: 10 }}>
      <Button title={t("admTpl.checkFields")} icon="search" variant="soft" loading={run.isPending} disabled={!text.trim()} onPress={() => run.mutate()} />
      {res ? (
        <SectionCard title={t("admTplB.fieldsFound", { n: res.fields.length })}>
          {res.fields.length ? <FieldList fields={res.fields} /> : <Text variant="small" tone="gray">{t("admTplB.noFields")}</Text>}
        </SectionCard>
      ) : null}
    </View>
  );
}
