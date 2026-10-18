import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A new role: a code name (latin, digits, underscore), a title, an optional description and the chosen permission codes.
export const roleSchema = z.object({
  name: rules.slug.max(60, rules.m("max", 60)),
  title: rules.text(1, 120),
  description: rules.optText(500),
  permissions: z.array(z.string()),
});
