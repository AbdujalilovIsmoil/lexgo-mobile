import { useState } from "react";
import type { QuoteInput } from "@/entities/doc-analysis";

export const MAX_PAGES = 500;
export const INCLUDED_PAGES = 10; // until the document service settings say otherwise; each quote's included_pages confirms it
const CHARS_PER_PAGE = 2500; // the backend counts one page per 2 500 characters of text

// Page count from pasted text, 1..500 (pagesFor() on the web).
export const pagesFor = (text: string) => Math.min(MAX_PAGES, Math.max(1, Math.ceil(text.trim().length / CHARS_PER_PAGE)));

type Rules = { included: number; review: boolean };

// The price inputs of the analysis screen: page count (typed, else counted from the text) and the four options. `included` is the
// pages the base price covers; without the review mode (switched off by the platform) the advocate review is not offered.
export function useOptions(text: string, { included, review }: Rules) {
  const [pagesInput, setPagesInput] = useState(""); // "" = counted from the text
  const [ocr, setOcr] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [lawyerReview, setLawyerReview] = useState(false);
  const [writtenOpinion, setWrittenOpinion] = useState(false);
  const typed = Number(pagesInput);
  const pageCount = pagesInput && Number.isInteger(typed) ? typed : pagesFor(text);
  const pagesOk = pageCount >= 1 && pageCount <= MAX_PAGES;
  const input: QuoteInput = { pageCount, ocr, lawyerReview: review && lawyerReview, urgent, writtenOpinion };
  return { pagesInput, setPagesInput: (v: string) => setPagesInput(v.replace(/[^\d]/g, "")), ocr, setOcr, urgent, setUrgent, lawyerReview: input.lawyerReview, setLawyerReview, writtenOpinion, setWrittenOpinion, pageCount, pagesOk, input, included, review };
}

export type Options = ReturnType<typeof useOptions>;
