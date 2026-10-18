// What the seller-side order payload carries beyond the basics (TZ 10, 11, 13, 14). All read as the backend sent them.
export type SnapOption = { id: string; label: string; amount: number };
export type QuoteSnap = { base: number; additional: number; total: number; options: SnapOption[] };
export type PackSnap = { id: string; title: string; tier: string; duration: string; included: string[] };
export type ResultFile = { fileId: string; fileName: string; downloadUrl: string };
export type OrderResult = { text: string; files: ResultFile[]; at: string };

// A supplemental payment request: the order is `waiting_payment` and paused until it is approved / expires.
export type AdditionalPay = { id: string; status: string; total: number; note: string; optionIds: string[]; requestedAt: string; expiresAt: string };

// The client's 15-minute rating window as the backend reports it (TZ 14). The seller only reads it.
export type OrderRating = { available: boolean; closed: boolean; reason: string; deadlineAt: string; remainingSeconds: number; stars: number; comment: string; fetchedAt: number };
