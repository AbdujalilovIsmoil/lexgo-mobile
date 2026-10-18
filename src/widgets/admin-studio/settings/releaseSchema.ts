import { z } from "zod";
import * as rules from "@/shared/form/rules";

// New release: a title (2+ characters), an optional description, an environment and at least one object.
export const releaseSchema = z.object({
  title: rules.text(2, 200), description: rules.optText(2000), env: z.string(), ids: z.array(z.string()).min(1, rules.m("pick")),
});
export const RELEASE_EMPTY = { title: "", description: "", env: "staging", ids: [] as string[] };
