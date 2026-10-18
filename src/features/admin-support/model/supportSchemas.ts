import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Support sheets: a required, human-worded resolution / reason (own messages), and an optional reopen note.
const req = (key: string, max: number) => z.string().trim().min(1, key).max(max, rules.m("max", max));

export const closeSchema = z.object({ resolution: req("admSup.resolutionRequired", 2000) });
export const supportTransferSchema = z.object({ reason: req("admSup.reasonRequired", 1000) });
export const reopenSchema = z.object({ reason: rules.optText(1000) });
