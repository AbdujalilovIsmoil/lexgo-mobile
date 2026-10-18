import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Manual status move: the target status must be chosen; the note is optional.
export const statusSchema = z.object({ to: rules.pick, note: rules.optText(500) });
