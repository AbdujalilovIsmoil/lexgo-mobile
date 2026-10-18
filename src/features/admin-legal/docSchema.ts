import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A consent document: a code slug, a version, a title and the text (the text is sent as typed, only checked for being non-blank).
export const docSchema = z.object({
  slug: rules.slug.max(60, rules.m("max", 60)),
  version: rules.text(1, 40),
  title: rules.text(1, 200),
  body: z.string().refine((v) => v.trim() !== "", rules.m("required")),
  active: z.boolean(),
  major: z.boolean(),
});
