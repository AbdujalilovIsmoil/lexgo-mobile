// What a phone pastes is rarely the bare value: a code copied from SMS or Telegram comes inside its message ("Kod: 123 456", "123-456"),
// a password from a note or a chat brings a trailing newline or space and invisible marks (zero-width, direction marks, a BOM).

// Zero-width spaces / joiners, word joiner, BOM, soft hyphen and the left-to-right / right-to-left marks and embeddings.
const INVISIBLE = /[­​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

/** The `length`-digit code in whatever was typed or pasted: the first group of exactly that many digits (spaces / dashes between them
 *  allowed), else the digits in order, cut to `length`. */
export function codeFrom(text: string, length: number): string {
  const clean = text.replace(INVISIBLE, "");
  for (const run of clean.match(/\d[\d  -]*\d|\d/g) ?? []) {
    const digits = run.replace(/\D/g, "");
    if (digits.length === length) return digits;
  }
  return clean.replace(/\D/g, "").slice(0, length);
}

/** A LexGo code ("LX-12345678", "LXLGA4791716": gift, referral) in whatever was typed or pasted — a copied message around it is dropped;
 *  without one the text is kept, upper-cased and without spaces, as it is being typed. */
export function lxCodeFrom(text: string): string {
  const up = text.replace(INVISIBLE, "").toUpperCase();
  return (up.match(/LX-?[A-Z0-9]{4,}/)?.[0] ?? up).replace(/\s/g, "");
}

/** A secret (password) as it was meant: invisible marks dropped and the whitespace / line breaks around it trimmed. */
export const secretFrom = (text: string): string => text.replace(INVISIBLE, "").trim();

/** Whether a change put several characters in at once (a paste or an AutoFill) rather than one keystroke. */
export const isBulkInsert = (prev: string, next: string): boolean => next.length - prev.length > 1;
