import { z } from "zod";
import * as rules from "@/shared/form/rules";
import type { DocKind } from "@/entities/admin-b2b";

export const digitsOnly = (x: string) => x.replace(/\D/g, "");

// New product: a title is required, the price is a whole number (empty = 0), the description is free.
export const productSchema = z.object({ title: rules.text(1, 200), price: rules.optIntText(), description: rules.optText(4000) });
export const PRODUCT_EMPTY = { title: "", price: "", description: "" };

// New corporate client: only the company name is required; the other fields are short optional texts.
export const clientSchema = z.object({
  name: rules.text(1, 200), inn: rules.optText(20), director: rules.optText(120), industry: rules.optText(120),
  contact: rules.optText(100), monthly: rules.optIntText(0, 1e12), sla: rules.optText(200),
});
export const CLIENT_EMPTY = { name: "", inn: "", director: "", industry: "", contact: "", monthly: "", sla: "" };

// Document: an invoice needs an amount above zero (shown with spaces while typing); a contract and a report need nothing typed.
export const documentSchema = (kind: DocKind) => z.object({
  amount: z.string().refine((v) => kind !== "invoice" || Number(digitsOnly(v)) > 0, rules.m("required")), description: rules.optText(500),
});
