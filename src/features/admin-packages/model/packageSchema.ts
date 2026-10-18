import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { emptyDraft, fromPkg, isReady, type Pkg, type PkgDraft } from "@/entities/admin-packages";

// The text part of a package: a title is required, the price is a whole number, the rest is free text.
export const packageSchema = z.object({
  title: rules.text(1, 200), price: rules.optIntText(), refund: rules.optText(4000), included: rules.optText(8000), excluded: rules.optText(8000),
});
export type PkgTexts = z.infer<typeof packageSchema>;

export const textsOf = (p: Pkg | null): PkgTexts => {
  const d = p ? fromPkg(p) : emptyDraft();
  return { title: d.title, price: d.price, refund: d.refund, included: d.included, excluded: d.excluded };
};
// The structure (services, milestones) must be complete before sending; the texts are checked by the schema.
export const structureReady = (d: PkgDraft) => isReady({ ...d, title: "x" });
