import { useState } from "react";
import type { Pkg } from "@/entities/admin-packages";
import { useServiceNames } from "@/features/admin-packages";
import { FactRows, FormSheet, SectionCard, StatusPill } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { PkgActions } from "./PkgActions";
import { PkgPreview } from "./PkgPreview";

type Props = { pkg: Pkg | null; onClose: () => void; onEdit: (p: Pkg) => void };

// One package: money split, services, milestones, the lifecycle buttons and a preview of the client / seller view.
export function PkgSheet({ pkg, onClose, onEdit }: Props) {
  const { t, locale } = useT();
  const p = useKept(pkg);
  const names = useServiceNames();
  const [preview, setPreview] = useState(false);
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  return (
    <FormSheet visible={!!pkg} onClose={() => { setPreview(false); onClose(); }} title={p?.title ?? ""} subtitle={p?.code || p?.workId} snaps={[0.7, 0.94]}>
      {p ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={p.status} /> }, { label: t("ag5.packagePrice"), value: som(p.price) }, { label: t("ag5.sim.separate"), value: som(p.separatePrice) },
            { label: t("ag5.sim.savings"), value: som(p.savings) }, { label: t("ag5.sim.seller"), value: som(p.sellerTotal) }, { label: t("ag5.sim.lexgo"), value: som(p.lexgoShare) },
            { label: t("ag5.version"), value: String(p.version) }, { label: t("ag5.region"), value: humanizeSlug(p.regionMode) }, { label: t("ag5.approvedAt"), value: fmtDateTime(p.approvedAt, locale) },
          ]} />
          <PkgActions pkg={p} onEdit={() => onEdit(p)} onDone={onClose} />
          <SectionCard title={t("ag5.components")}>
            {p.components.map((c, i) => <Text key={i} variant="small">{names.byId.get(c.serviceId)?.name ?? "—"} · {som(c.clientPrice)} → {som(c.sellerFee)} · {t(`ag5.kinds.${c.kind}`)}</Text>)}
          </SectionCard>
          <SectionCard title={t("ag5.milestones")}>
            {p.milestones.map((m, i) => <Text key={i} variant="small">{i + 1}. {m.title} — {m.percent}%{m.criteria ? ` (${m.criteria})` : ""}</Text>)}
          </SectionCard>
          {preview ? <PkgPreview id={p.id} /> : <Button title={t("ag5.preview")} icon="eye" variant="soft" onPress={() => setPreview(true)} />}
        </>
      ) : null}
    </FormSheet>
  );
}
