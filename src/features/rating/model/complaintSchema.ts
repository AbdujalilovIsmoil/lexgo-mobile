import { z } from "zod";
import { COMPLAINT_CATEGORIES, DESC_MAX, DESC_MIN, SUBJECT_MAX, SUBJECT_MIN } from "@/entities/rating/model/complaint";
import * as rules from "@/shared/form/rules";

// A new complaint: one of the known categories, a short subject, and what happened in enough words to be acted on.
export const complaintSchema = z.object({
  category: z.string().refine((v) => COMPLAINT_CATEGORIES.some((c) => c === v), rules.m("pick")),
  subject: rules.text(SUBJECT_MIN, SUBJECT_MAX),
  desc: rules.text(DESC_MIN, DESC_MAX),
});
