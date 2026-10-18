import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Text, toast } from "@/shared/ui";
import { SectionCard, SelectField } from "@/shared/ui/admin";
import { byOrder, exportAll, exportVersions, listObjects, studioKeys, useStudioAccess, useStudioErrorText, useStudioText } from "@/entities/admin-studio";
import { useInsets } from "@/shared/lib/insets";

// Excel exports: every studio object in one file, or the full version history of one object.
export function ExportPanel({ bar }: { bar: ReactElement }) {
  const { t, ctorName, status } = useStudioText();
  const errText = useStudioErrorText();
  const insets = useInsets();
  const a = useStudioAccess();
  const [code, setCode] = useState("");
  const [objId, setObjId] = useState("");
  const [busy, setBusy] = useState("");
  const objs = useQuery({ queryKey: [...studioKeys.all, "export-objects", code], queryFn: () => listObjects({ code, limit: 200 }), enabled: !!code });
  const list = objs.data?.items ?? [];
  const picked = list.find((o) => o.id === objId);
  const run = (k: string, fn: () => Promise<void>) => (setBusy(k), fn().catch((e) => toast(errText(e), "err")).finally(() => setBusy("")));
  return (
    <KeyboardAwareScrollView bottomOffset={24} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 14 }}>
      {bar}
      <SectionCard title={t("admStudioC.export.allTitle")}>
        <Text variant="small" tone="gray">{t("admStudioC.export.allText")}</Text>
        <Button title={t("admStudioC.export.allBtn")} icon="download" variant="gradient" loading={busy === "all"} onPress={() => run("all", exportAll)} />
      </SectionCard>
      <SectionCard title={t("admStudioC.export.verTitle")}>
        <Text variant="small" tone="gray">{t("admStudioC.export.verText")}</Text>
        <SelectField label={t("admStudioC.export.pickCtor")} value={code} options={a.constructors.map((c) => c.code).sort(byOrder).map((c) => ({ value: c, label: `${c} · ${ctorName(c)}` }))} onChange={(v) => (setCode(v), setObjId(""))} searchable />
        {code && !objs.isLoading && !list.length ? <Text variant="caption" tone="gray">{t("admStudioC.export.noObjects")}</Text> : null}
        {list.length ? <SelectField label={t("admStudioC.export.pickObj")} value={objId} options={list.map((o) => ({ value: o.id, label: o.title || o.id, hint: `${status(o.status, o.statusRaw)}${o.currentVersion ? ` · v${o.currentVersion}` : ""}` }))} onChange={setObjId} searchable /> : null}
        <View><Button title={t("admStudioC.export.verBtn")} icon="download" variant="line" disabled={!picked} loading={busy === "ver"} onPress={() => picked && run("ver", () => exportVersions(picked.id, picked.title))} /></View>
      </SectionCard>
    </KeyboardAwareScrollView>
  );
}
