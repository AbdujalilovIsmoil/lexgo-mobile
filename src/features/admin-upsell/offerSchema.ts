import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A "last day" that may stay empty; when typed it must be a full YYYY-MM-DD date.
const optDate = z.string().refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), rules.m("date"));

// Personal offer: the client must be picked, a title is required; price whole, plan / reason / date optional.
export const offerSchema = z.object({ clientId: rules.pick, title: rules.text(1, 200), price: rules.optIntText(), planId: z.string(), reason: rules.optText(1000), until: optDate });
export const OFFER_EMPTY = { clientId: "", title: "", price: "", planId: "", reason: "", until: "" };
