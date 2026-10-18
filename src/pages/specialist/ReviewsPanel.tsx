import { EmptyState } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import type { Lawyer } from "@/entities/lawyer";
import { ReviewsList } from "@/widgets/lawyer-sheet";

// "Mijozlar fikri": the client reviews with the specialist's replies, or the web's "Hali sharh yo'q" card.
export function ReviewsPanel({ lawyer: l }: { lawyer: Lawyer }) {
  const { t } = useT();
  return (
    <ProfileSection accent="green" icon="message-square" title={t("mkd.reviews")}>
      {l.reviewList.length ? <ReviewsList lawyer={l} bare /> : <EmptyState compact icon="star" title={t("mkd.noReviews")} text={t("mkd.noReviewsText")} />}
    </ProfileSection>
  );
}
