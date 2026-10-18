// Topics a client can pick (the backend's own list from GET /support/meta is merged in on top).
export const CLIENT_TOPICS = ["subscription", "payment", "document", "marketplace", "urgent_advokat", "account", "technical"] as const;

const ALIAS: Record<string, string> = { documents: "document" };
const RULES: [string, RegExp][] = [
  ["payment", /to.?lov|payme|click|karta|pul|оплат|платеж|платёж|payment|card/i],
  ["subscription", /tarif|obuna|paket|тариф|подписк|plan|subscription/i],
  ["urgent_advokat", /tezkor|срочн|urgent/i],
  ["marketplace", /advokat|yurist|адвокат|юрист|lawyer/i],
  ["document", /hujjat|ariza|shartnoma|документ|договор|document/i],
  ["account", /parol|login|kirish|hisob|пароль|аккаунт|account|password/i],
  ["technical", /xato|ishlamay|крэш|ошибк|не работает|error|bug|crash/i],
];

/** Topic key for a free-text problem, limited to `allowed`; "general" when nothing matches. */
export function guessCategory(text: string, allowed: readonly string[]): string {
  const hit = RULES.find(([key, re]) => allowed.includes(key) && re.test(text));
  return hit ? hit[0] : "general";
}

/** A route/query value ("payment", "documents") → an allowed topic key, or "". */
export function topicOf(raw: string, allowed: readonly string[]): string {
  const v = raw.trim().toLowerCase();
  const key = ALIAS[v] ?? v;
  return allowed.includes(key) ? key : "";
}
