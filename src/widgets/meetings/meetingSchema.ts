import { z } from "zod";
import * as rules from "@/shared/form/rules";

// New meeting: the name is optional (sent as typed), at least one person must be invited.
export const meetingSchema = z.object({
  title: z.string().max(120, rules.m("max", 120)),
  ids: z.array(z.string()).min(1, rules.m("pick")),
});
