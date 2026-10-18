import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { normPhone } from "@/shared/lib/phone";

// A family member: a real name, a complete Uzbek number nobody else in the family already has, an optional relation.
export const familySchema = (taken: string[]) =>
  z.object({
    name: rules.personName,
    phone: rules.phone.refine((v) => !taken.includes(normPhone(v)), "py6.dupe"),
    relation: rules.optText(40),
    shared: z.boolean(),
  });
