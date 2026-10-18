import { z } from "zod";
import * as rules from "@/shared/form/rules";

// "Not useful" feedback: the comment is optional and sent as typed (max 500).
export const feedbackSchema = z.object({ comment: z.string().max(500, rules.m("max", 500)) });
