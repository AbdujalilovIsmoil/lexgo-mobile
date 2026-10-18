import { z } from "zod";
import * as rules from "@/shared/form/rules";

// New folder / rename: a non-empty name (at most 180 characters).
export const nameSchema = z.object({ name: rules.text(1, 180) });
// A comment on a file.
export const commentSchema = z.object({ text: rules.text(1, 2000) });
