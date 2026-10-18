import { AdminGate } from "@/entities/access";
import AdminReviewsPage from "@/pages/admin-reviews/AdminReviewsPage";

export default function Screen() {
  return (
    <AdminGate id="reviews">
      <AdminReviewsPage />
    </AdminGate>
  );
}
