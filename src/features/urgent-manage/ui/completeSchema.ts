import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Completion result: the summary is required, the next step is optional.
export const completeSchema = z.object({ summary: rules.text(5, 4000), next: rules.optText(500) });
// Group chat completion: the summary may stay empty.
export const chatCompleteSchema = z.object({ summary: rules.optText(4000) });
