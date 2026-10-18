import type { Messages } from "../uz";

export const ad4: Messages["ad4"] = {
  startTitle: "Where do we start?",
  startLead: "Before opening the editor, choose which file the work starts from.",
  openEditor: "Open editor",
  sourceTitle: "Editor source",
  sourceLead: "Changing the source closes the current editor session.",
  chooseSource: "Choose source",
  source: { template: "Clean template", blank: "Blank document", ai_draft: "AI draft", attachment: "Client's file" },
  uploadOwn: "Upload my own DOCX",
  unavailable: "This option is not available for this work",
  sourceFail: "Could not change the source.",
  switchTitle: "Change the source?",
  switchAsk: "The current editor session closes and the document opens from the new source. Unsaved changes may be lost.",
  switchYes: "Change",
};
