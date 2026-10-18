import type { Messages } from "../uz";

export const dc3: Messages["dc3"] = {
  enter: "Enter",
  datePh: "DD.MM.YYYY",
  pickDate: "Calendar",
  today: "Today",
  dateFormat: "The date is written as DD.MM.YYYY.",
  weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  err: {
    required: "Required field",
    email: "Invalid email",
    phone: "Phone number is incomplete",
    date: "Invalid date (DD.MM.YYYY)",
    pattern: "Invalid format",
    min: "Value is too small",
    max: "Value is too large",
    short: "Too short",
    long: "Too long",
  },
};
