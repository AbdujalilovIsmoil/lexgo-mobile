import { EmptyState } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { useSellerRating, type Lawyer } from "@/entities/lawyer";
import { ReviewsList } from "@/widgets/lawyer-sheet";
import { RatingBreakdownView } from "@/widgets/rating-breakdown";

// How the rating is made (the web's public breakdown, GET /marketplace/lawyers/{id}/rating) when the backend has one, then "Mijozlar
// fikri": the client reviews with the specialist's replies, or the web's "Hali sharh yo'q" card.
export function ReviewsPanel({ lawyer: l }: { lawyer: Lawyer }) {
  const { t } = useT();
  const breakdown = useSellerRating(l.userId).data;
  return (
    <>
      {breakdown ? (
        <ProfileSection accent="blue" icon="award" title={t("rbd.title")}>
          <RatingBreakdownView data={breakdown} />
        </ProfileSection>
      ) : null}
      <ProfileSection accent="green" icon="message-square" title={t("mkd.reviews")}>
        {l.reviewList.length ? <ReviewsList lawyer={l} bare /> : <EmptyState compact icon="star" title={t("mkd.noReviews")} text={t("mkd.noReviewsText")} />}
      </ProfileSection>
    </>
  );
}
