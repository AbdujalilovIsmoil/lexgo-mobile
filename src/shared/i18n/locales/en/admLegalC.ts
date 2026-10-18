import type { Messages } from "../uz";

export const admLegalC: Messages["admLegalC"] = {
  dirty: { title: "Changes not saved", text: "If you leave, your edits will be lost.", leave: "Leave", stay: "Keep editing" },
  hero: { versions: "Versions", ready: "Ready", placeholder: "Placeholder", missing: "Not published" },
  searchPh: "Document name or code",
  noResults: "Nothing found",
  view: "Read",
  rows: "Records: {n}",
  chars: "{chars} chars · {words} words",
  off: { title: "Switch document off", text: "\"{slug}\" v{version} will no longer be shown to users.", on: "Switch document on", onText: "\"{slug}\" v{version} will be shown again." },
  off404: "Legal documents module is off",
  off404Text: "The server has not enabled this section yet.",
};
