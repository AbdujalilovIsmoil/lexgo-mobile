import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Review of a finished marketplace job: 1–5 stars and an optional comment.
export const reviewSchema = z.object({ stars: z.number().min(1, rules.m("pick")), comment: rules.optText(500) });
