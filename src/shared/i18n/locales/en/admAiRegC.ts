import type { Messages } from "../uz";

export const admAiRegC: Messages["admAiRegC"] = {
  up: {
    title: "Upload a reglament file",
    lead: "The backend extracts the text and saves it as a reglament version.",
    choose: "Choose a file",
    rules: ".docx, .doc or .pdf · up to 20 MB",
    badType: "Upload a .docx, .doc or .pdf file",
    tooBig: "The file is too large: 20 MB max",
    empty: "The file is empty",
    needFile: "Choose a file first",
    target: "Reglament",
    submit: "Upload",
    done: "File uploaded: {title} · v{v}",
  },
  gapStatus: {
    open: "Open",
    resolved: "Resolved",
    closed: "Closed",
    ignored: "Ignored",
    answered: "Answered",
  },
  roles: {
    client: "Client",
    yurist: "Lawyer",
    advokat: "Advocate",
    lawyer: "Lawyer",
    advocate: "Advocate",
    guest: "Guest",
    staff: "Staff",
    operator: "Operator",
  },
};
