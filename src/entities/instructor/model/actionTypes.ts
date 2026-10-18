import type { Command } from "./types";

export type PreviewRow = { label: string; value: string };

// POST /ai/instructor/actions/preview — what WOULD happen; nothing is executed yet.
export type ActionPreview = {
  action: string;
  title: string;
  summary: string;
  amount: number | null;
  currency: string;
  amountText: string;
  actor: string;
  rows: PreviewRow[];
  warnings: string[];
  confirmToken: string;
  expiresAt: string;
  canExecute: boolean;
  requiresConfirmation: boolean;
};

// POST /ai/instructor/actions/confirm — the executed outcome (never "paid": payments stay pending).
export type ActionResult = {
  status: string;
  message: string;
  paymentUrl: string;
  nextHref: string;
  ticketId: string;
  workId: string;
  resultRef: string;
  commands: Command[];
};

export type CmdStatus = "pending" | "running" | "done" | "missing" | "failed" | "cancelled" | "skipped";
