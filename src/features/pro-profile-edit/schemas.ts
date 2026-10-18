import { z } from "zod";
import * as rules from "@/shared/form/rules";

const free = (max: number) => z.string().max(max, rules.m("max", max));
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const directionsSchema = z.object({ specializations: z.array(z.string()), bio: free(1000) });
export const regionSchema = z.object({ region: rules.pick, district: free(100) });
export const personalSchema = z.object({
  name: z.string().trim().min(2, "sl4.err.name").max(120, rules.m("max", 120)),
  email: z.string().trim().refine((v) => !v || MAIL.test(v), "sl4.err.email"),
  languages: z.array(z.string()),
});
// Experience numbers are typed as text (digits only); wins + partial wins cannot exceed the total.
const years = rules.optIntText(0, 70);
const num = rules.optIntText();
export const experienceSchema = z.object({ experienceYears: years, lawyerExperienceYears: years, totalCases: num, winsCount: num, partialWinsCount: num, hourlyPrice: num })
  .refine((v) => Number(v.winsCount) + Number(v.partialWinsCount) <= Number(v.totalCases), { path: ["winsCount"], message: "sl4.err.stats" });
// An advocate must give a licence number; a yurist has no licence fields.
export const licenseSchema = (adv: boolean) =>
  z.object({
    licenseNumber: adv ? z.string().trim().min(1, "adm.required").max(60, rules.m("max", 60)) : z.string().trim(),
    barAssociation: free(200), advocateStructure: z.string(), organizationName: free(200), education: free(2000),
  });
