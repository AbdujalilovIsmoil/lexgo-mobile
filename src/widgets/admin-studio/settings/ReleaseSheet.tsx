import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { usePublishRelease, useStudioText, useValidateRelease, type StudioRelease } from "@/entities/admin-studio";
import { Button, Pill, Text, confirmDialog } from "@/shared/ui";
import { FactRows, FormSheet, RowCard } from "@/shared/ui/admin";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";

type Props = { release: StudioRelease | null; onClose: () => void };

// One release: its objects with the last validation result; re-validate, and publish it (a separate permission: confirmed first).
export function ReleaseSheet({ release, onClose }: Props) {
  const { t, locale, ctorName } = useStudioText();
  const r = useKept(release);
  const val = useValidateRelease();
  const pub = usePublishRelease();
  const can = useAccess().can();
  const done = r?.status === "published";
  const publish = () => r && confirmDialog({ title: t("ag9.rel.publish"), message: t("ag9.rel.publishAsk", { name: r.title, env: r.environment }), confirmLabel: t("ag9.rel.publish"), cancelLabel: t("adm.cancel"), icon: "upload-cloud", onConfirm: async () => { await pub.mutateAsync(r.id); onClose(); } });
  return (
    <FormSheet visible={!!release} onClose={onClose} title={r?.title ?? ""} subtitle={r ? humanizeSlug(r.environment) : undefined} snaps={[0.7, 0.94]}>
      {r ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <Pill label={humanizeSlug(r.status)} tone={done ? "ok" : "warn"} small /> }, { label: t("ag9.rel.objects"), value: String(r.objectCount) },
            { label: t("ag9.rel.valid"), value: r.ok === null ? "" : r.ok ? t("adm.yes") : t("adm.no") }, { label: t("adm.created"), value: fmtDateTime(r.createdAt, locale) }, { label: t("ag9.rel.publishedAt"), value: fmtDateTime(r.publishedAt, locale) },
          ]} />
          {r.description ? <Text variant="small">{r.description}</Text> : null}
          {r.items.map((i) => <RowCard key={i.objectId} icon={i.ok ? "check-circle" : "alert-triangle"} tint={i.ok ? "#22C55E" : "#EF4444"} title={`${i.code} · ${ctorName(i.code)}`} subtitle={i.errors.join(" · ") || `v${i.version}`} meta={humanizeSlug(i.status)} />)}
          {can && !done ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title={t("ag9.rel.validate")} icon="shield" variant="line" loading={val.isPending} onPress={() => val.mutate(r.id)} style={{ flex: 1 }} />
              <Button title={t("ag9.rel.publish")} icon="upload-cloud" loading={pub.isPending} disabled={r.ok === false} onPress={publish} style={{ flex: 1 }} />
            </View>
          ) : null}
        </>
      ) : null}
    </FormSheet>
  );
}
