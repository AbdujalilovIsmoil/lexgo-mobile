import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isDate } from "@/shared/ui/admin";
import { isHex } from "./columnKey";

// A phone is "complete enough" with 7+ digits (the backend normalises the rest).
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 7;
const classes = { category: z.string(), region: z.string() };

export const createLeadSchema = z.object({
  name: rules.text(1, 120), phone: z.string().trim().refine(phoneOk, "adm.required"), ...classes, note: rules.optText(2000), operatorId: z.string(),
});
// Editing: a name or a phone is enough, but a phone that is typed must be complete.
export const editLeadSchema = z.object({
  name: rules.optText(120), phone: z.string().trim().refine((v) => v === "" || phoneOk(v), "adm.required"), ...classes, urgency: z.string(), note: rules.optText(2000),
}).refine((v) => !!(v.name || v.phone), { path: ["name"], message: "adm.required" });

export const lostSchema = z.object({ reason: z.string(), note: rules.optText(2000) });
export const leadNoteSchema = z.object({ text: rules.text(1, 2000) });
export const reminderSchema = z.object({ date: z.string().refine(isDate, rules.m("date")) });
export const columnSchema = z.object({ name: rules.text(1, 80), color: z.string().refine(isHex, rules.m("required")) });
