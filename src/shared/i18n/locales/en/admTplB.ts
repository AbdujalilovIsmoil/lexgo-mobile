import type { Messages } from "../uz";

export const admTplB: Messages["admTplB"] = {
  types: {
    text: "text",
    date: "date",
    money: "money",
    number: "number",
    phone: "phone",
    pinfl: "PINFL",
    checkbox: "checkbox",
    multiline: "multiline",
  },
  fieldsFound: "{n} fields found",
  noFields: "No {{…}} markers found — check the file.",
  draftNote: "The template is a draft; check field types via Edit and activate it.",
  upload: "Upload",
  docxDone: "Template created: {n} fields.",
  zipDone: "{n} templates imported (drafts).",
  slugTaken: "This slug is taken — use another.",
  onlyDocx: "Only DOCX is accepted.",
  onlyZip: "Only ZIP is accepted.",
  tooBig: "File is over 20 MB.",
  importError: "Import failed.",
};
