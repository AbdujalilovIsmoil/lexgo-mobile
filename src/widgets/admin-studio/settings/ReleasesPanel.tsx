import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { useReleases, useStudioText, type StudioRelease } from "@/entities/admin-studio";
import { Button, Pill } from "@/shared/ui";
import { PagedList, RowCard } from "@/shared/ui/admin";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { PanelHead } from "./PanelHead";
import { ReleaseForm } from "./ReleaseForm";
import { ReleaseSheet } from "./ReleaseSheet";

// Releases: bundles of approved objects published together to an environment (create, validate, publish).
export function ReleasesPanel({ bar }: { bar: ReactElement }) {
  const { t, locale } = useStudioText();
  const query = useReleases();
  const canCreate = useAccess().can();
  const [open, setOpen] = useState<StudioRelease | null>(null);
  const [form, setForm] = useState(false);
  return (
    <>
      <PagedList
        data={query.data ?? []} query={query} keyExtractor={(r) => r.id} empty={{ icon: "package", title: t("ag9.rel.empty") }}
        renderItem={(r) => (
          <RowCard icon="package" tint={r.status === "published" ? "#22C55E" : "#F59E0B"} title={r.title} subtitle={`${humanizeSlug(r.environment)} · ${t("ag9.rel.objectsN", { n: r.objectCount })}`} meta={fmtDate(r.createdAt, locale)} right={<Pill label={humanizeSlug(r.status)} tone={r.status === "published" ? "ok" : "warn"} small />} onPress={() => setOpen(r)} />
        )}
        header={<View style={{ gap: 12, paddingBottom: 12 }}>{bar}<PanelHead title={t("ag9.rel.title")} text={t("ag9.rel.lead")}>{canCreate ? <Button title={t("ag9.rel.new")} icon="plus" variant="gradient" size="sm" onPress={() => setForm(true)} /> : null}</PanelHead></View>}
      />
      <ReleaseSheet release={open} onClose={() => setOpen(null)} />
      <ReleaseForm visible={form} onClose={() => setForm(false)} />
    </>
  );
}
