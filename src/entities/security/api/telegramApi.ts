import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { TelegramLink } from "../model/types";
import { deadline } from "./deadline";

const TTL = 10 * 60_000;
const safe = (s: string) => /^(https:|tg:)\/\//i.test(s);

// POST /telegram/link/start → a one-time t.me deep link ({ share_url, expires_at }) valid 10 minutes;
// pressing Start in the bot links the account. There is no status/unlink endpoint.
export async function startTelegramLink(): Promise<TelegramLink> {
  const top = asDict(await http("/telegram/link/start", { method: "POST", body: {} }));
  const d = Object.keys(asDict(top.data)).length ? asDict(top.data) : top;
  const keys = ["share_url", "deep_link", "deeplink", "url", "link", "link_url", "telegram_url", "telegram_link", "telegram_bot_link", "bot_link"];
  let url = keys.map((k) => asStr(d[k]).trim()).find(safe) ?? "";
  const bot = asStr(d.bot_username ?? d.bot).replace(/^(@|https:\/\/t\.me\/)/i, "");
  const token = asStr(d.token ?? d.link_token ?? d.start_token ?? d.code);
  if (!url && /^\w+$/.test(bot) && token) url = `https://t.me/${bot}?start=${encodeURIComponent(token)}`;
  return { url, expiresAt: deadline(d.expires_at, TTL, TTL), linked: d.linked === true || d.already_linked === true };
}
