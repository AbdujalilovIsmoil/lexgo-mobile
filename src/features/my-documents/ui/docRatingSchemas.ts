import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Rating of a document: 1–5 stars, an optional comment; at 1–2 stars the complaint text (sent as typed) can follow.
export const docRatingSchema = z.object({
  stars: z.number().min(1, rules.m("pick")),
  comment: rules.optText(500),
  complaint: z.string().max(2000, rules.m("max", 2000)),
});
// "Send to advocate review": what is needed is optional (a default is supplied on submit).
export const docReviewSchema = z.object({ need: rules.optText(2000) });
