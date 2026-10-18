import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Hand a request over: an advocate must be picked, the reason is optional.
export const transferSchema = z.object({ pick: rules.pick, reason: rules.optText(500) });
