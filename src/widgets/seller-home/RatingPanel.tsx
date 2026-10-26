import { useMyRating } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { RatingBreakdownView } from "@/widgets/rating-breakdown";
import { Panel } from "./Panel";

// "Reytingingiz" (GET /marketplace/me/rating, the web dashboard's breakdown): folded to "82 ball · ★ 4.7" until tapped. Nothing is shown
// while the backend has no breakdown for this seller (404).
export function RatingPanel({ i }: { i: number }) {
  const { t, locale } = useT();
  const d = useMyRating(true).data;
  if (!d) return null;
  const stars = d.rated && d.publicRating !== null ? `★ ${fmtRating(d.publicRating, locale)}` : t("rbd.unrated");
  const fold = d.rankingScore !== null ? t("rbd.fold", { score: Math.round(d.rankingScore), reviews: stars }) : stars;
  return (
    <Panel i={i} icon="award" tint="#F4B63F" title={t("rbd.titleMine")} fold={fold}>
      <RatingBreakdownView data={d} mine />
    </Panel>
  );
}
