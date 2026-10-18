import { readSecret, writeSecret } from "./storage";

// Persistent anonymous client id for the AI API (guest chats), same role as
// lib/client.ts on the web. Cached in memory after the first read.
const KEY = "lexgo_client_id";
let cached: string | null = null;

function randomId(): string {
  const rnd = () => Math.random().toString(16).slice(2, 10);
  return `${rnd()}-${rnd().slice(0, 4)}-4${rnd().slice(0, 3)}-${rnd().slice(0, 4)}-${rnd()}${rnd().slice(0, 4)}`;
}

export async function getClientId(): Promise<string> {
  if (cached) return cached;
  const stored = await readSecret(KEY);
  if (stored) return (cached = stored);
  const id = randomId();
  await writeSecret(KEY, id);
  return (cached = id);
}
