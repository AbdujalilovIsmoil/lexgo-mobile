import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getReview, listReviews, moderateReview } from "../api/reviewApi";
import type { Moderation, ReviewFilter } from "./types";

export const reviewKeys = { all: ["admin-reviews"] as const };

export const useReviews = (f: ReviewFilter) => useQuery({ queryKey: [...reviewKeys.all, "list", f], queryFn: () => listReviews(f) });
export const useReview = (id: string | null) => useQuery({ queryKey: [...reviewKeys.all, "detail", id], queryFn: () => getReview(id ?? ""), enabled: !!id });

// Approve or reject a pending review (optional moderator note); lists and details are refetched.
export const useModerate = () =>
  useAdminMutation({
    mutationFn: ({ id, ...m }: Moderation & { id: string }) => moderateReview(id, m),
    invalidate: [reviewKeys.all],
    success: "admRev.moderated",
  });
