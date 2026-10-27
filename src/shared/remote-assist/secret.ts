import type { RaSensitivity } from "./types";

// A control whose id names one of these is secret and is never put on the map, whatever the screen declared (TZ RA §3, §9): passwords,
// one-time codes, PINs, cards and bank details, e-signatures, biometrics, identity documents, tokens and security settings.
const SECRET = new Set([
  "password", "passcode", "parol", "otp", "sms", "pin", "cvv", "cvc", "card", "cards", "karta", "bank", "iban", "esign", "signature",
  "sign", "imzo", "eimzo", "biometric", "biometrics", "passport", "pasport", "pinfl", "jshshir", "identity", "myid", "oneid", "kyc",
  "token", "secret", "security", "2fa", "totp", "recovery",
]);
// The same words in a label, in the three app languages.
const SECRET_LABEL = /(parol|пароль|password|\bpin\b|cvv|cvc|sms[ -]?(kod|код|code)|one[- ]time|karta raqami|номер карт|card number|imzo|подпис|signature|pasport|паспорт|passport)/i;
// Personal data: the operator may fill it only with the client's separate personal_form_fill consent.
const PERSONAL = new Set(["name", "fullname", "firstname", "lastname", "surname", "middlename", "phone", "tel", "email", "mail", "address", "birth", "birthday", "dob", "region"]);

const tokens = (id: string): string[] => id.toLowerCase().split(/[.\-_:\s/]+/).filter(Boolean);

/** The sensitivity a control really has: a declared level is only ever raised (normal → personal → secret), never lowered. */
export function sensitivityOf(id: string, label: string, declared: RaSensitivity = "normal"): RaSensitivity {
  const words = tokens(id);
  if (declared === "secret" || words.some((w) => SECRET.has(w)) || SECRET_LABEL.test(label)) return "secret";
  if (declared === "personal" || words.some((w) => PERSONAL.has(w))) return "personal";
  return "normal";
}
