import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The text part of a gift: who it is for (free text), the recipient's number (optional, complete when given), a short message.
export const giftSchema = z.object({ hint: rules.optText(80), phone: rules.optPhone, message: rules.optText(300) });
