import type { Messages } from "../uz";

export const dm8: Messages["dm8"] = {
  addFile: "File",
  addPhoto: "Photo",
  voice: "Voice note",
  stop: "Stop",
  remove: "Remove",
  voiceItem: "Voice note {n}",
  micDenied: "Microphone access denied. Turn it on in settings.",
  hint: "{types} · up to {mb} MB each",
  err: { badType: "This file type is not accepted. Allowed: {types}.", tooBig: "A file must not be larger than {mb} MB.", tooMany: "You can attach at most {n} files." },
  consentTitle: "Consent to contact by the advocate",
  consentLabel: "I agree that the advocate may contact me about this document, hold calls and online meetings, and discuss the details the document needs.",
  consentHint: "The consent applies to this request only and ends once the document is ready.",
  consentRequired: "Your consent is needed to send the request — switch it on.",
  consentRead: "Read the text",
  consentClose: "Collapse",
  consentGiven: "Consent given",
  mainPick: "Upload the document to check",
  mainChange: "Tap to choose another file",
  mainHint: "{types} · up to {mb} MB",
  mainRequired: "Upload the document to check.",
};
