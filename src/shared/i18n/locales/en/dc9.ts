import type { Messages } from "../uz";

export const dc9: Messages["dc9"] = {
  offer: "A duty advocate reviews the document and writes an opinion. The price follows the page count measured by the server.",
  urgent: "Rush",
  urgentHint: "A surcharge is added to the price",
  noteLabel: "Note to the advocate",
  quoteFailed: "Could not calculate the price.",
  noTelegram: "Not delivered to Telegram",
  sent: { title: "Sent to the duty advocate", text: "Your request is in the advocates' queue. We will tell you when one takes it." },
  wait: { title: "Waiting for Telegram approval", text: "Nothing reaches an advocate until the fee is approved in Telegram. The status updates by itself." },
  stopped: { title: "The fee was not approved", text: "The request was cancelled. Send it again if you still need it." },
  already: { title: "A request already exists", text: "An advocate request already exists for this document. A new one can be sent once it ends." },
};
