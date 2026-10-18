import type { Messages } from "../uz";

export const sl3: Messages["sl3"] = {
  docs: {
    title: "Proof documents",
    hint: "Licence, diploma or another document. PDF, JPG or PNG, up to 15 MB.",
    none: "No documents uploaded yet",
    kindLabel: "Document type",
    kind: { license: "Licence", diploma: "Diploma", qualification: "Other qualification" },
    pickFile: "Choose file",
    pickCamera: "Take photo",
    upload: "Upload",
    uploaded: "Document uploaded",
    tooBig: "The file is larger than 15 MB",
    badType: "Only PDF, JPG or PNG",
  },
  submit: {
    go: "Send for review",
    again: "Send again",
    title: "Send the application?",
    text: "A moderator will check your details. The result arrives as a notification.",
    done: "Application sent",
    waiting: "Your application is under review. The result arrives as a notification.",
  },
};
