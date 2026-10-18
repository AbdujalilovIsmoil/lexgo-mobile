import { useState } from "react";
import type { QuoteInput } from "@/entities/doc-analysis";

export const MAX_PAGES = 500;
export const INCLUDED_PAGES = 10; // backend default; the quote's included_pages confirms it per request
const CHARS_PER_PAGE = 2500; // the backend counts one page per 2 500 characters of text

// Page count from pasted text, 1..500 (pagesFor() on the web).
export const pagesFor = (text: string) => Math.min(MAX_PAGES, Math.max(1, Math.ceil(text.trim().length / CHARS_PER_PAGE)));

// The price inputs of the analysis screen: page count (typed, else counted from the text) and the four options.
export function useOptions(text: string) {
  const [pagesInput, setPagesInput] = useState(""); // "" = counted from the text
  const [ocr, setOcr] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [lawyerReview, setLawyerReview] = useState(false);
  const [writtenOpinion, setWrittenOpinion] = useState(false);
  const typed = Number(pagesInput);
  const pageCount = pagesInput && Number.isInteger(typed) ? typed : pagesFor(text);
  const pagesOk = pageCount >= 1 && pageCount <= MAX_PAGES;
  const input: QuoteInput = { pageCount, ocr, lawyerReview, urgent, writtenOpinion };
  return { pagesInput, setPagesInput: (v: string) => setPagesInput(v.replace(/[^\d]/g, "")), ocr, setOcr, urgent, setUrgent, lawyerReview, setLawyerReview, writtenOpinion, setWrittenOpinion, pageCount, pagesOk, input };
}

export type Options = ReturnType<typeof useOptions>;
