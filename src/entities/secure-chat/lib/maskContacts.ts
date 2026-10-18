// Contact masking for secure chat (law-main/lib/chatFilter.ts): links, @handles and phone
// numbers are hidden at display time so people can't swap off-platform contacts.
const SOCIAL = /\b(?:t\.me|telegram\.me|instagram\.com|wa\.me|whatsapp\.com|facebook\.com|fb\.com|vk\.com)\/\S+/gi;
const URL_RE = /\bhttps?:\/\/\S+/gi;
const USERNAME = /(^|[\s(])@[A-Za-z0-9_.]{2,}/g;
const PHONE = /(?:\+?\d[\s\-().]?){8,}\d/g;
const MASK = "•••";
const ALLOWED = /zoom\.us|zoom\.com/i;

export function maskContacts(input: string): string {
  if (!input) return input;
  return input
    .replace(SOCIAL, (m) => (ALLOWED.test(m) ? m : MASK))
    .replace(URL_RE, (m) => (ALLOWED.test(m) ? m : MASK))
    .replace(USERNAME, (m) => m.replace(/@[A-Za-z0-9_.]{2,}/, MASK))
    .replace(PHONE, MASK);
}
