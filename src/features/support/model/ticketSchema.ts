import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The first message of a support chat: at least a few real characters (the operator cannot help with "hi").
export const ticketSchema = z.object({ message: rules.text(3, 4000) });
