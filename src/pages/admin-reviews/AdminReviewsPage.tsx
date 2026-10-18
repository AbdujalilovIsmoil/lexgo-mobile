import { useState } from "react";
import { ReviewRow, useReviews, type Review, type ReviewFilter } from "@/entities/admin-reviews";
import { ModerateButtons, ModerateSheet, type ModerateTarget } from "@/features/admin-reviews";
import { ReviewHeader, ReviewSheet } from "@/widgets/admin-reviews";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

// Moderation of client reviews: hero, status tiles, filters, open the detail, approve / reject pending ones with a note.
export default function AdminReviewsPage() {
  const { t } = useT();
  const [filter, setFilter] = useState<ReviewFilter>({ status: "", sellerType: "", rating: 0 });
  const [open, setOpen] = useState<Review | null>(null);
  const [mod, setMod] = useState<ModerateTarget | null>(null);
  const q = useReviews(filter);
  const all = useReviews({ ...filter, status: "" }).data ?? [];
  return (
    <AdminPage title={t("admHub.mod.reviews.title")} subtitle={t("admRev.lead")} right={<ExportButton id="reviews" />}>
      <PagedList
        skeletonHeight={110}
        data={q.data ?? []}
        query={q}
        keyExtractor={(r) => r.id}
        renderItem={(r) => (
          <ReviewRow item={r} onPress={() => setOpen(r)} actions={r.status === "pending" ? <ModerateButtons onPick={(status) => setMod({ review: r, status })} /> : undefined} />
        )}
        empty={{ icon: "message-square", title: t("admRev.empty"), text: t("admRev.emptyText") }}
        header={<ReviewHeader all={all} value={filter} onChange={setFilter} />}
      />
      <ReviewSheet item={open} onClose={() => setOpen(null)} />
      <ModerateSheet target={mod} onClose={() => setMod(null)} />
    </AdminPage>
  );
}
