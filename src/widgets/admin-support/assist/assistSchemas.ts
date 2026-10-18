import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { NEED_MIN } from "@/entities/admin-support";

export const NEED_MAX = 4000;

// Text parts of the three assist requests. Search boxes (q) and picks are plain fields; the rest is validated on "Next".
export const docSchema = z.object({ q: z.string(), title: rules.optText(200), need: rules.text(1, NEED_MAX), language: z.string(), docType: z.string() });
export const marketSchema = z.object({ q: z.string(), serviceId: z.string(), channel: z.string(), time: rules.optText(120), note: rules.optText(1000) });
export const urgentSchema = z.object({ kind: z.string(), channel: z.string(), count: z.number(), dirs: z.array(z.string()), need: rules.text(NEED_MIN, NEED_MAX) });
