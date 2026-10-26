import type { Messages } from "../uz";

// The professional's AI case tool (the web's portal.assistant), with short tool names for the phone.
export const pas: Messages["pas"] = {
  "title": "AI assistant",
  "subtitle": "Quick case help: summary, deadlines, a draft reply",
  "caseLabel": "Case materials or question",
  "casePh": "Paste the case facts or a document's text here…",
  "chars": "{n} characters",
  "needText": "Paste at least a few lines of the case",
  "tools": "Tools",
  "run": "Ask",
  "thinking": "Thinking…",
  "failed": "Couldn't answer right now.",
  "answer": "Answer",
  "disclaimer": "AI doesn't replace an advocate — the final legal decision stays with the advocate.",
  "piiNote": "Privacy: phone numbers, email addresses, PINFL (JShShIR) and passport numbers are masked before they are sent to the AI.",
  "copy": "Copy",
  "copied": "Copied",
  "clear": "Clear",
  "short": {
    "summarize": "Summary",
    "chronology": "Chronology",
    "compare": "Compare",
    "contradictions": "Contradictions",
    "missing": "Missing",
    "deadlines": "Deadlines",
    "questions": "Questions",
    "draft": "Draft"
  },
  "full": {
    "summarize": "Summarize the case",
    "chronology": "Event chronology",
    "compare": "Compare documents",
    "contradictions": "Find contradictions",
    "missing": "Missing documents",
    "deadlines": "Extract deadlines",
    "questions": "Question list",
    "draft": "Draft a reply"
  },
  "inst": {
    "summarize": "Give a short, precise summary of the case: key facts, parties and current status.",
    "chronology": "Build a date-ordered chronology of events from the case materials.",
    "compare": "Compare the case documents and point out differences and inconsistencies.",
    "contradictions": "Identify contradictions in the information and list them.",
    "missing": "List documents that are missing or should be requested from the client.",
    "deadlines": "Extract important deadlines and dates for the case (appeal, filing, etc.).",
    "questions": "Prepare a list of clarifying questions for the client or witnesses.",
    "draft": "Draft an official reply or application for the case."
  }
};
