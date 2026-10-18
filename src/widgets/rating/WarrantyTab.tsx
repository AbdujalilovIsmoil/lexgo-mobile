import { useState } from "react";
import { useWarranty, type WarrantyClaim } from "@/entities/rating";
import { PagedList, RowCard } from "@/shared/ui/admin";
import { Pill } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";
import { WarrantySheet } from "./WarrantySheet";
import { WarrantyHero } from "./WarrantyHero";
import { WarrantyResultSheet } from "./WarrantyResultSheet";
import { tOr } from "@/shared/lib/pay/tOr";

// LexGo warranty: ask for a lawyer replacement and follow the requests (claims + replacements).
export function WarrantyTab() {
  const { t, locale } = useT();
  const q = useWarranty();
  const [form, setForm] = useState(false);
  const [result, setResult] = useState<WarrantyClaim | null>(null);
  const rows = [...(q.data?.claims ?? []), ...(q.data?.replacements ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const { items, query } = useSlicedList(rows, q, "w");
  return (
    <>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(w) => w.id}
        renderItem={(w) => {
          return <RowCard icon="shield" title={w.reason || t("py10.w.claim")} subtitle={w.kind === "replacement" ? t("py10.w.claim") : undefined} meta={[w.workId, fmtDate(w.createdAt, locale)].filter(Boolean).join(" · ")} right={<Pill label={tOr(t, "py10.w.status", w.status)} tone={w.status === "approved" ? "ok" : w.status === "rejected" ? "err" : "warn"} small />} />;
        }}
        empty={{ icon: "shield", title: t("pwr.wr.noClaims") }}
        header={
          <WarrantyHero onRequest={() => setForm(true)} />
        }
      />
      <WarrantySheet visible={form} onClose={() => setForm(false)} onSent={setResult} />
      <WarrantyResultSheet claim={result} onClose={() => setResult(null)} />
    </>
  );
}
