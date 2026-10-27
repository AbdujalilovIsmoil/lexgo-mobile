import { useMyRating } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { MyRatingView } from "@/widgets/rating-breakdown";
import { Panel } from "./Panel";

// "Reytingingiz" (GET /marketplace/me/rating): folded to "★ 4.7" (or the unrated text) until tapped. Nothing is shown while the backend has
// no rating for this seller (404).
export function RatingPanel({ i }: { i: number }) {
  const { t, locale } = useT();
  const d = useMyRating(true).data;
  if (!d) return null;
  const fold = d.rated ? `★ ${fmtRating(d.rating, locale)}` : d.unratedText || t("rt3.unrated");
  return (
    <Panel i={i} icon="award" tint="#F4B63F" title={t("rt3.title")} fold={fold}>
      <MyRatingView data={d} />
    </Panel>
  );
}
