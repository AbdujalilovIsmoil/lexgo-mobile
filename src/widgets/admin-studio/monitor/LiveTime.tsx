import { useEffect, useState } from "react";
import { Text } from "@/shared/ui";

const clock = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  const p = (n: number) => String(n).padStart(2, "0");
  return s >= 3600 ? `${Math.floor(s / 3600)}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
};

// Work time of an online session: the server's seconds plus the time since the data was loaded, ticking every second.
export function LiveTime({ base, loadedAt }: { base: number; loadedAt: number }) {
  const [now, setNow] = useState(loadedAt);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <Text variant="small" weight="bold" tone="ok">{clock(base + (now - loadedAt) / 1000)}</Text>;
}
