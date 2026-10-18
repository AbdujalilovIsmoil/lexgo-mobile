import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Hand-over: the advocate must be picked; the reason is optional.
export const transferSchema = z.object({ pick: rules.pick, reason: rules.optText(500) });
