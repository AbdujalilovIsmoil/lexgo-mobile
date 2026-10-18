import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Result text is optional on its own: a file may stand in for it (the pair is checked in completionBody, TZ 13).
export const completeSchema = z.object({ text: rules.optText(4000) });
